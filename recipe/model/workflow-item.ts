export interface WorkflowItem {
    type: 'start' | 'action' | 'condition' | 'end' | 'final_action';
    id: string;
    comment?: string;
}
