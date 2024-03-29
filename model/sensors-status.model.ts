import { SensorType, TempSensorTypeId } from './sensor-type.model';
import { GpioStatus } from './gpio-status.model';

export interface SensorTempConnected {
    sensor_id: string;
    sensor_type: SensorType;
    temperature: number;
    ts: Date;
}

export type SensorTempConnectedObj = {
    [id in TempSensorTypeId]?: SensorTempConnected;
};

export type SensorTempErrorObj = {
    [id in TempSensorTypeId]?: {
        ts: string;
        error: string;
    };
};

export interface SensorsStatus {
    ts: Date;

    temp_sensors: SensorTempConnectedObj;
    temp_errors: SensorTempErrorObj;

    gpios: GpioStatus[];
    gpios_ts: Date;

    adcs: number[];
    adcs_ts: Date;

    pressure: number[];
    pressure_ts: Date;
}
