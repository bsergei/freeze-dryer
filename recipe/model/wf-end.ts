import { WorkflowItem } from './workflow-item';

export interface WfEnd extends WorkflowItem {
    type: 'end';
}
