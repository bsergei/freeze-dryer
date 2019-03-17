import { WorkflowItem } from "./workflow-item";

export interface RecipeEntry {
    id: string;
    name: string;
    workflow: WorkflowItem[];
}
