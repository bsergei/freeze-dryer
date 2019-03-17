import { WorkflowItem } from './workflow-item';

export interface WfStart extends WorkflowItem {
    type: 'start';
    next_id: string;
}
