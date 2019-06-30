import { RecipeEntryRuntime } from './recipe-entry-runtime';

export class RecipeRuntimeState {
    public isStarted: boolean = false;
    public isFinished: boolean = false;
    public isAborted: boolean = false;

    public steps: RecipeEntryRuntime[] = [];
    public currentStep: RecipeEntryRuntime;

    constructor(public name: string) {
    }
}

export class RecipeRuntimeStateWrapper {
    constructor(private r: RecipeRuntimeState) {
    }

    public get context(): string {
        if (this.r && this.r.currentStep) {
            return `'${this.r.name}':'${this.r.currentStep.recipeEntry.name}':'${this.r.currentStep.currentWorkflowItem.id}'`;
        } else {
            return '';
        }
    }
}
