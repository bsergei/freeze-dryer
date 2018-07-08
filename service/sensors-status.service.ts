import { injectable, inject } from "inversify";
import { TempSensorService } from "./temp-sensor.service";
import { TempSensorOptService } from "./temp-sensor-opt.service";
import TYPES from "../constant/types";
import { SensorTypes } from "../model/sensor-type.model";
import { SensorsStatus, SensorTempConnected } from "../model/sensors-status.model";

@injectable()
export class SensorsStatusService {

    constructor(
        @inject(TYPES.TempSensorService) private tempSensorService: TempSensorService,
        @inject(TYPES.TempSensorOptService) private sensorOptService: TempSensorOptService) {
    }

    public async getSensorsStatus() {
        const result: SensorsStatus = {
            temp_sensors: []
        }
        
        const sensorOpts = await this.sensorOptService.getSensorOpts();
        const sensorIds = await this.tempSensorService.getSensors();
        for (const sensorType of SensorTypes) {
            const tempSensor: SensorTempConnected = {
                sensor_id: undefined,
                sensor_type: sensorType,
                temperature: 0
            }
            const sensorOpt = sensorOpts.find(v => v.sensor_type === sensorType.id);
            if (sensorOpt) {
                tempSensor.sensor_id = sensorIds.find(v => v === sensorOpt.sensor_id);
            }

            if (tempSensor.sensor_id) {
                // if valid sensor.
                result.temp_sensors.push(tempSensor);
            }
        }

        const temperatureValues = await Promise.all(result.temp_sensors
            .map(v => v.sensor_id 
                ? this.tempSensorService.getTemperature(v.sensor_id) 
                : Promise.resolve<number>(undefined))
            );
        
        for (let i = 0; i < temperatureValues.length; i++) {
            result.temp_sensors[i].temperature = temperatureValues[i];
        }

        return result;
    }
}