export interface WorkflowItem {
    type: 'start' | 'action' | 'condition' | 'end';
    id: string;
    cmd?: string;
    comment?: string;
}
