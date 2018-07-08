import { SensorType } from "./sensor-type.model";

export interface SensorTempConnected {
    sensor_type: SensorType;
    sensor_id: string;
    temperature: number;
}

export interface SensorsStatus {
    temp_sensors: SensorTempConnected[];
}