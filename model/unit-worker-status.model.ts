import { CompressorWorkerParams } from './compressor-worker-params.model';
import { VacuumWorkerParams } from './vacuum-worker-params.model';
import { HeaterWorkerParams } from './heater-worker-params.model';

export type UnitWorkerId = keyof UnitWorkerParams;
export type UnitWorkerParamTypes = CompressorWorkerParams | VacuumWorkerParams | HeaterWorkerParams;

export interface UnitWorkerStatus {
    runningIds: UnitWorkerId[];
    params: {
        [id in keyof UnitWorkerParams]: {
            p: UnitWorkerParams[id],
            heartbeat: number,
            startedTime: number,
        }
    };
}

export interface UnitWorkerParams {
    compressor?: CompressorWorkerParams;
    vacuum?: VacuumWorkerParams;
    heater?: HeaterWorkerParams;
}
