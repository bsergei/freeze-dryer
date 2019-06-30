import { WorkflowItem } from './workflow-item';

export interface RecipeEntry {
    id: string;
    name: string;
    tag?: string;
    workflow: WorkflowItem[];
}
