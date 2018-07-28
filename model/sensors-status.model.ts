import { SensorType } from "./sensor-type.model";
import { GpioStatus } from "./gpio-status.model";

export interface SensorTempConnected {
    sensor_type: SensorType;
    sensor_id: string;
    temperature: number;
}

export interface SensorsStatus {
    asOfDate: Date;
    temp_sensors: SensorTempConnected[];
    gpios: GpioStatus[];
    adcs: number[];
}