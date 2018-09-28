import { BaseUnitWorkerParams } from './unit-worker-params.model';

export interface VacuumWorkerParams extends BaseUnitWorkerParams {
    targetPressure: number;
    histeresis: number;
}
