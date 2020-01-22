import { WorkflowItem } from './workflow-item';

export interface WfStart extends WorkflowItem {
    type: 'start';
    next_id: string;
    on_error_id?: string;
    on_abort_id?: string;
}
