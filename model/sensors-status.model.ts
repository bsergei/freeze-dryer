import { SensorType } from './sensor-type.model';
import { GpioStatus } from './gpio-status.model';

export interface SensorTempConnected {
    sensor_type: SensorType;
    sensor_id: string;
    temperature: number;
}

export interface SensorsStatus {
    asOfDate: Date;

    temp_sensors: SensorTempConnected[];
    temp_sensors_asOfDate: Date;

    gpios: GpioStatus[];
    gpios_asOfDate: Date;

    adcs: number[];
    adcs_asOfDate: Date;

    pressure: number;
    pressure2: number;
    pressure3: number;
    pressure4: number;
    pressure_asOfDate: Date;
}
