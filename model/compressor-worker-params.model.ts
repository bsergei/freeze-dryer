import { BaseUnitWorkerParams } from './unit-worker-params.model';

export interface CompressorWorkerParams extends BaseUnitWorkerParams {
    minCondenser1Temp: number; // -40.0
    minFreezerCameraTemp: number; // -35.0
    maxCompressorTemp: number; // 50.0
    debounceTime: number; // 180 sec
}
