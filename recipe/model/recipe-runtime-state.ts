import { RecipeEntryRuntime } from './recipe-entry-runtime';
import { SharedData } from './shared-data';

export class RecipeRuntimeState implements SharedData {
    public isFinished: boolean = false;
    public isAborted: boolean = false;

    public steps: RecipeEntryRuntime[] = [];
    public currentStep: RecipeEntryRuntime;

    public error: Error;

    constructor(public recipeName: string) {
    }

    public get cursorStr(): string {
        if (this.currentStep && this.currentStep.recipeEntry && this.currentStep.currentWorkflowItem) {
            return `'${this.recipeName}':'${this.currentStep.recipeEntry.name}':'${this.currentStep.currentWorkflowItem.id}'`;
        } else {
            return '';
        }
    }
}
