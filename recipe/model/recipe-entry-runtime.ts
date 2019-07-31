import { WorkflowItem } from './workflow-item';

export interface RecipeEntryRuntime {
    recipeEntryName: string;

    isFinished: boolean;

    startTime: Date;
    finishTime?: Date;

    currentWorkflowItem?: WorkflowItem;
}
