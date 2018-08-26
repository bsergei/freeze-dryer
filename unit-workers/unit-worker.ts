import { UnitControllerResult } from '../unit-control';

export interface UnitWorker {
    getId(): string;
    onStart(): Promise<void>;
    onTick(): Promise<UnitControllerResult>;
    onStop(): Promise<void>;
    getParams(): any;
}
