import { TempSensorTypeId } from './sensor-type.model';

export interface HeaterWorkerParams {
    tempSensors: {
        tempSensor: TempSensorTypeId,
        targetTemperature: number
    }[];
    histeresis: number;
}
