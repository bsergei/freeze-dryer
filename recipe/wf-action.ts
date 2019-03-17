import { WorkflowItem } from './workflow-item';

export interface WfAction extends WorkflowItem {
    type: 'action';
    cmd: string;
    next_id: string;
}
