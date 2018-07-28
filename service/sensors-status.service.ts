import { injectable } from "inversify";
import { TempSensorService } from "./temp-sensor.service";
import { TempSensorOptService } from "./temp-sensor-opt.service";
import { SensorTypes } from "../model/sensor-type.model";
import { SensorsStatus, SensorTempConnected } from "../model/sensors-status.model";
import { GpioService } from "./gpio.service";
import { StorageService } from "./storage.service";
import { AdcService } from "./adc.service";

const StorageSensorStatusKey = 'storage:sensor-status';

@injectable()
export class SensorsStatusService {

    constructor(
        private tempSensorService: TempSensorService,
        private sensorOptService: TempSensorOptService,
        private gpioService: GpioService,
        private adcService: AdcService,
        private storageService: StorageService) {
    }

    public async getSensorsStatus() {
        const adcsPromise =
            Promise.all([
                this.adcService.readAdc(0),
                this.adcService.readAdc(1),
                this.adcService.readAdc(2),
                this.adcService.readAdc(3)
            ]);

        const result: SensorsStatus = {
            asOfDate: new Date(),
            temp_sensors: [],
            gpios: this.gpioService.getAll(),
            adcs: []
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

        result.adcs = await adcsPromise;
        return result;
    }

    public saveInCache(status: SensorsStatus) {
        return this.storageService.set<SensorsStatus>(StorageSensorStatusKey, status);
    }

    public getFromCache() {
        return this.storageService.get<SensorsStatus>(StorageSensorStatusKey);
    }
}