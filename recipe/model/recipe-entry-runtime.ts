import { WorkflowItem } from './workflow-item';
import { RecipeEntry } from './recipe-entry';

export class RecipeEntryRuntime {
    public isFinished = false;

    public startTime: Date;
    public finishTime: Date;

    public currentWorkflowItem: WorkflowItem;

    constructor(public recipeEntry: RecipeEntry) {
    }
}
