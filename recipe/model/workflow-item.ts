export interface WorkflowItem {
    type: 'start' | 'action' | 'condition' | 'end';
    id: string;
    comment?: string;
}
