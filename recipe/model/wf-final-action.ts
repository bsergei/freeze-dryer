import { WorkflowItem } from './workflow-item';

export interface WfFinalAction extends WorkflowItem {
    type: 'final_action';
    cmd: string;
}
