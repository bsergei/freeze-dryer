import { UnitControllerResult } from '../unit-control';
import { UnitWorkerId, UnitWorkerParams } from '../model';

export interface UnitWorker<T extends UnitWorkerId = UnitWorkerId> {
    kind: T;
    onStart(): Promise<void>;
    onTick(): Promise<UnitControllerResult>;
    onStop(): Promise<void>;
    getParams(): UnitWorkerParams[T];
    getLastUpdated(): number;
    getStartedTime(): number;
}
