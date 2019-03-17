import { WorkflowRunnerServiceFactory } from "./workflow-runner.service";
import { StorageService } from "../service/storage.service";
import { RecipeStorage } from "./recipe-storage.service";
import { Log } from "../service/logger.service";
import { RecipeRuntimeState, RecipeRuntimeStateWrapper } from "./recipe-runtime-state";
import { RecipeEntryRuntime } from "./recipe-entry-runtime";

export class RecipeRunnerService {

    constructor(
        private workflowRunnerServiceFactory: WorkflowRunnerServiceFactory,
        private recipeStorage: RecipeStorage,
        private storageService: StorageService,
        private log: Log) {
    }

    public async start(name: string) {

        let state = await this.getCurrentState();
        if (state != null && !state.isFinished) {
            this.log.info(`Cannot start recipe ${name}: another recipe is running`)
            return false;
        }

        this.log.info(`Recipe: '${name}' is starting`)

        const rtRecipe = this.recipeStorage.get(name);
        await this.updateFromRuntime(rtRecipe.state);

        try {
            for (const entry of rtRecipe.recipe.entries) {
                this.log.info(`Recipe: '${name}'.'${entry.name}' is starting`)
                const runtimeEntry = new RecipeEntryRuntime(entry);
                rtRecipe.state.currentStep = runtimeEntry;
                rtRecipe.state.steps.push(runtimeEntry);

                const wfRunner = this.workflowRunnerServiceFactory.create(entry.workflow);
                wfRunner.start(new RecipeRuntimeStateWrapper(rtRecipe.state));

                runtimeEntry.isStarted = true;
                runtimeEntry.startTime = new Date();

                do {
                    runtimeEntry.currentWorkflowItem = wfRunner.getCurrent();
                    await this.updateFromRuntime(rtRecipe.state);
                    if (rtRecipe.state.isAborted) {
                        this.log.info(`Recipe: '${name}' detected abort`)
                        return true;
                    }
                } while (await wfRunner.runCurrentItem())

                runtimeEntry.isFinished = true;
                runtimeEntry.finishTime = new Date();

                this.updateFromRuntime(rtRecipe.state);
                if (rtRecipe.state.isAborted) {
                    this.log.info(`Recipe: '${name}' detected abort`)
                    return true;
                }
            }
            return true;
        } finally {
            await this.updateSetFinished();
        }
    }

    public async getCurrentState() {
        return await this.storageService.get<RecipeRuntimeState>('recipe-status');
    }

    public async abort() {
        const result = await this.updateState(v => {
            if (v && !v.isFinished) {
                v.isAborted = true;
            }
            return v;
        });

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
        })
        if (result) {
            this.log.info(`Recipe: '${result.name}' finished`)
        }
    }

    private async updateFromRuntime(state: RecipeRuntimeState) {
        await this.updateState(v => {
            if (v) {
                state.isAborted = v.isAborted;
                state.isStarted = v.isStarted;
                state.isFinished = v.isFinished;
            }
            return state;
        })
    }
}
