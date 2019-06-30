import { WorkflowItem } from './workflow-item';

export interface WfCondition extends WorkflowItem {
    type: 'condition';
    cmd: string;
    next_id_true: string;
    next_id_false: string;
}
