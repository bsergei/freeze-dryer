import { WfContextValues } from './wf-context-values';

export class WfTimeContext {
    constructor(
        private startTime: Date,
        private values: WfContextValues) {
    }

    public get total_hours() {
        return Math.abs(new Date().getTime() - this.startTime.getTime()) / (60*60*1000.0);
    }

    public get total_minutes() {
        return Math.abs(new Date().getTime() - this.startTime.getTime()) / (60*1000.0);
    }

    public get total_seconds() {
        return Math.abs(new Date().getTime() - this.startTime.getTime()) / (1000.0);
    }

    public wait(delaySeconds: number) {
        this.values.waitDelay = delaySeconds * 1000;
    }
}
