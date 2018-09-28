import { TempSensorTypeId } from './sensor-type.model';
import { BaseUnitWorkerParams } from './unit-worker-params.model';

export interface HeaterWorkerParams extends BaseUnitWorkerParams {
    tempSensors: {
        tempSensor: TempSensorTypeId,
        targetTemperature: number
    }[];
    histeresis: number;
}
