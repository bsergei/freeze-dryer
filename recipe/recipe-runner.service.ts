import { WorkflowRunnerServiceFactory } from './workflow-runner.service';
import { StorageService } from '../service/storage.service';
import { RecipeStorage } from './recipe-storage.service';
import { Log } from '../service/logger.service';
import { RecipeRuntimeState } from './model/recipe-runtime-state';
import { RecipeEntryRuntime } from './model/recipe-entry-runtime';
import { injectable } from 'inversify';

@injectable()
export class RecipeRunnerService {

    constructor(
        private workflowRunnerServiceFactory: WorkflowRunnerServiceFactory,
        private recipeStorage: RecipeStorage,
        private storageService: StorageService,
        private log: Log) {
    }

    public async startAsFireAndForget(recipeName: string) {
        let state = await this.getCurrentState();
        if (state && !state.isFinished) {
            this.log.info(`Cannot start recipe ${recipeName}: another recipe is running`);
            return false;
        }

        this.start(recipeName);
        return true;
    }

    private async start(recipeName: string) {
        this.log.info(`Recipe: '${recipeName}' is starting`);

        const recipe = await this.recipeStorage.get(recipeName);
        const state = new RecipeRuntimeState(recipe.name);
        await this.updateFromRuntime(state, true);

        try {
            for (const entry of recipe.entries) {
                this.log.info(`Recipe: '${recipeName}'.'${entry.name}' is starting`);

                const runtimeEntry = new RecipeEntryRuntime(entry);
                runtimeEntry.startTime = new Date();

                state.steps.push(runtimeEntry);
                state.currentStep = runtimeEntry;

                await this.updateFromRuntime(state);

                //
                // Run workflow for recipe entry.
                //
                const wfRunner = this.workflowRunnerServiceFactory.create(entry.workflow, state);
                while (wfRunner.moveNext()) {
                    runtimeEntry.currentWorkflowItem = wfRunner.getCurrent();

                    await this.updateFromRuntime(state);
                    if (state.isAborted) {
                        this.log.info(`Recipe: '${recipeName}' detected abort`);
                        return true;
                    }

                    await wfRunner.runCurrentItem();
                    await new Promise((resolve => setTimeout(() => resolve(), 100)));
                }

                runtimeEntry.isFinished = true;
                runtimeEntry.finishTime = new Date();

                await this.updateFromRuntime(state);
                if (state.isAborted) {
                    this.log.info(`Recipe: '${recipeName}' detected abort`);
                    return true;
                }
            }
            return true;
        } catch (e) {
            await this.updateSetError(e);
        } finally {
            await this.updateSetFinished();
        }
    }

    public async getCurrentState() {
        return await this.storageService.get<RecipeRuntimeState>('recipe-status');
    }

    public async abort() {
        const result = await this.updateSetAborted();
        return result && result.isAborted === true;
    }

    private async updateState(func: (v: RecipeRuntimeState) => RecipeRuntimeState) {
        const result = await this.storageService.updateWithLock<RecipeRuntimeState>(
            'recipe-status',
            v => func(v),
            false
        );
        if (result) {
            await this.storageService.publish('recipe-status', result);
        }
        return result;
    }

    private async updateSetFinished() {
        const result = await this.updateState(v => {
            if (v) {
                v.isFinished = true;
            }
            return v;
        });

        if (result && result.isFinished) {
            this.log.info(`Recipe: '${result.recipeName}' finished`);
        }

        return result;
    }

    private async updateSetError(error) {
        const result = await this.updateState(v => {
            if (v) {
                v.error = error;
            }
            return v;
        });

        if (result && result.error) {
            this.log.error(`Recipe: '${result.recipeName}' FAILED with error: ${error}`);
        }

        return result;
    }

    private async updateSetAborted() {
        const result = await this.updateState(v => {
            if (v) {
                v.isAborted = true;
            }
            return v;
        });

        if (result && result.isAborted) {
            this.log.info(`Recipe: '${result.recipeName}' was requested to abort`);
        }

        return result;
    }

    private async updateFromRuntime(state: RecipeRuntimeState, isNew = false) {
        return await this.updateState(v => {
            if (isNew) {
                return state;
            }

            if (v) {
                // Preserve isAborted and error.
                state.isFinished = v.isFinished;
                state.isAborted = v.isAborted;
                state.error = v.error;
            }
            return state;
        });
    }
}
