import { WorkflowItem } from './workflow-item';

export interface RecipeEntry {
    name: string;
    workflow: WorkflowItem[];
}
