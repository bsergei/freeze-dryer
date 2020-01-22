import { WorkflowRunnerServiceFactory } from './workflow-runner.service';
import { StorageService } from '../service/storage.service';
import { RecipeStorage } from './recipe-storage.service';
import { Log } from '../service/logger.service';
import { RecipeRuntimeState } from './model/recipe-runtime-state';
import { RecipeEntryRuntime } from './model/recipe-entry-runtime';
import { injectable } from 'inversify';
import { ShutdownService } from '../service/shutdown.service';

@injectable()
export class RecipeRunnerService {

    constructor(
        private workflowRunnerServiceFactory: WorkflowRunnerServiceFactory,
        private recipeStorage: RecipeStorage,
        private storageService: StorageService,
        private shutdownService: ShutdownService,
        private log: Log) {
        // Cleanup and recover from unexpected shutdowns.
        this.storageService.delete(['recipe-status']);
        this.shutdownService.onSigint(() => this.abort());
    }

    public async startAsFireAndForget(recipeName: string) {
        let state = await this.getCurrentState();
        if (state && !state.isFinished) {
            this.logInfo(`Cannot start recipe ${recipeName}: another recipe is running`);
            return false;
        }

        this.start(recipeName);
        return true;
    }

    public async getCurrentState() {
        return await this.storageService.get<RecipeRuntimeState>('recipe-status');
    }

    public async abort() {
        const result = await this.updateSetAborted();
        return result && result.isAborted === true;
    }

    public getCursorStr(recipeName: string, entryName: string, wfId: string): string {
        return `'${recipeName}':'${entryName}':'${wfId}'`;
    }

    private async start(recipeName: string) {
        this.logInfo(`Recipe: '${recipeName}' is starting`);

        const recipe = await this.recipeStorage.get(recipeName);
        const state: RecipeRuntimeState = {
            recipeName: recipe.name,
            startDate: new Date(),
            isFinished: false,
            isAborted: false,
            steps: [],
            cursorStr: undefined
        };

        await this.updateFromRuntime(state, true);

        try {
            for (const entry of recipe.entries) {
                this.logInfo(`Recipe: '${recipeName}'.'${entry.name}' is starting`);

                const runtimeEntry: RecipeEntryRuntime = {
                    recipeEntryName: entry.name,
                    isFinished: false,
                    startTime: new Date()
                };

                state.steps.push(runtimeEntry);
                state.currentStep = runtimeEntry;

                await this.updateFromRuntime(state);

                //
                // Run workflow for recipe entry.
                //
                const wfRunner = this.workflowRunnerServiceFactory.create(entry.workflow, state);
                try {
                  while (wfRunner.moveNext()) {
                    const wf = wfRunner.getCurrent();
                    runtimeEntry.currentWorkflowItem = wf;
                    state.cursorStr = this.getCursorStr(recipe.name, entry.name, wf.id);

                    await this.updateFromRuntime(state);
                    if (state.isAborted) {
                      this.logInfo(`Recipe: '${recipeName}' detected abort`);
                      return true;
                    }

                    await wfRunner.runCurrentItem();
                    await new Promise((resolve => setTimeout(() => resolve(), 100)));

                    await this.updateFromRuntime(state);
                    if (state.isAborted) {
                      this.logInfo(`Recipe: '${recipeName}' detected abort`);
                      return true;
                    }
                  }
                } catch (err) {
                  await wfRunner.runOnError();
                  throw err;
                } finally {
                  if (state.isAborted) {
                    await wfRunner.runOnAbort();
                  }
                }

                runtimeEntry.isFinished = true;
                runtimeEntry.finishTime = new Date();

                await this.updateFromRuntime(state);
                if (state.isAborted) {
                    this.logInfo(`Recipe: '${recipeName}' detected abort`);
                    return true;
                }

                this.logInfo(`Recipe: '${recipeName}'.'${entry.name}' is finished.`);
            }
            return true;
        } catch (e) {
            await this.updateSetError(state, recipeName, e);
        } finally {
            await this.updateSetFinished();
        }
    }

    private logInfo(msg: string) {
        this.log.info(msg);
        this.storageService.publish('recipe-log', msg);
    }

    private logError(msg: string, error: Error) {
        this.log.error(msg, error);
        this.storageService.publish('recipe-log', msg);
        this.storageService.publish('recipe-log', error.message);
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
                v.endDate = new Date();
            }
            return v;
        });

        if (result && result.isFinished) {
            this.logInfo(`Recipe: '${result.recipeName}' finished`);
        }

        return result;
    }

    private async updateSetError(state: RecipeRuntimeState, recipeName: string, error: Error) {
        const cursorStr = (state && state.cursorStr)
            ? state.cursorStr
            : '[empty]';

        this.logError(`Recipe '${recipeName}' FAILED at ${cursorStr}`, error);
        const result = await this.updateState(v => {
            if (v) {
                v.error = error.message;
            }
            return v;
        });

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
            this.logInfo(`Recipe: '${result.recipeName}' was requested to abort`);
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
