import { injectable } from 'inversify';
import { TempSensorService } from './temp-sensor.service';
import { TempSensorOptService } from './temp-sensor-opt.service';
import { sensorTypes } from '../model/sensor-type.model';
import { SensorsStatus, SensorTempConnected } from '../model/sensors-status.model';
import { GpioService } from './gpio.service';
import { StorageService } from './storage.service';
import { AdcService } from './adc.service';
import { PressureSensorService } from './pressure-sensor.service';
import { Log } from './logger.service';
import { NotifyService } from './notify.service';

const storageSensorStatusKey = 'storage:sensor-status';

@injectable()
export class SensorsStatusService {

    constructor(
        private tempSensorService: TempSensorService,
        private sensorOptService: TempSensorOptService,
        private gpioService: GpioService,
        private adcService: AdcService,
        private pressureService: PressureSensorService,
        private storageService: StorageService,
        private log: Log,
        private notifyService: NotifyService) {
    }

    public async getGpios(errors: string[]) {
        const result: Partial<SensorsStatus> = {};
        result.gpios_asOfDate = new Date();
        try {
            result.gpios = this.gpioService.getAll();
        } catch (err) {
            result.gpios = [];
            const errorStr = 'Sensor Status: GPIO read error: ' + err;
            errors.push(errorStr);
        }
        return result;
    }

    public async getAdcs(errors: string[]) {
        const result: Partial<SensorsStatus> = {};
        result.adcs_asOfDate = new Date();
        try {
            const adcsPromise =
                Promise.all([
                    this.adcService.readAdc('A0'),
                    this.adcService.readAdc('A1'),
                    this.adcService.readAdc('A2'),
                    this.adcService.readAdc('A3')
                ]);
            result.adcs = await adcsPromise;
        } catch (err) {
            result.adcs = [];
            const errorStr = 'Sensor Status: ADCs read error: ' + err;
            errors.push(errorStr);
        }
        return result;
    }

    public async getTemperatures(errors: string[]) {
        const result: Partial<SensorsStatus> = {};
        result.temp_sensors_asOfDate = new Date();
        try {
            result.temp_sensors = await this.readTemperatures();
        } catch (err) {
            result.temp_sensors = [];
            const errorStr = 'Sensor Status: Temperature read error: ' + err;
            errors.push(errorStr);
        }
        return result;
    }

    public async getPressure(errors: string[]) {
        const result: Partial<SensorsStatus> = {};
        result.pressure_asOfDate = new Date();
        try {
            const pressures = Promise.all([
                this.pressureService.readPressure('A0'),
                this.pressureService.readPressure('A1'),
                this.pressureService.readPressure('A2'),
                this.pressureService.readPressure('A3')
            ]);
            const p = await pressures;
            result.pressure = p[0];
            result.pressure2 = p[1];
            result.pressure3 = p[2];
            result.pressure4 = p[3];
        } catch (err) {
            result.pressure = undefined;
            result.pressure2 = undefined;
            result.pressure3 = undefined;
            result.pressure4 = undefined;
            const errorStr = 'Sensor Status: Pressure read error: ' + err;
            errors.push(errorStr);
        }

        return result;
    }

    public async getSensorsStatus() {

        let errors: string[] = [];
        const all = Promise.all([
            this.getGpios(errors),
            this.getAdcs(errors),
            this.getTemperatures(errors),
            this.getPressure(errors)
        ]);
        const allPartialResults = await all;

        const result = this.getEmptySensorsStatus();

        this.assignPartialResults(result, allPartialResults);

        if (errors.length > 0) {
            this.notifyService.error(errors);
        }

        return result;
    }

    public updateInCache(partialResults: Partial<SensorsStatus>[]) {
        return this.storageService.updateWithLock<SensorsStatus>(storageSensorStatusKey,
            result => {
                if (!result) {
                    result = this.getEmptySensorsStatus();
                }
                this.assignPartialResults(result, partialResults);
                result.asOfDate = new Date();

                // Publish updated result.
                this.storageService.publish('sensors-status', result);

                return result;
            },
            false);
    }

    public async getFromCache() {
        await this.storageService.isConnected;
        const result = await this.storageService.get<SensorsStatus>(storageSensorStatusKey);
        return result || this.getEmptySensorsStatus();
    }

    private getEmptySensorsStatus() {
        const result: SensorsStatus = {
            asOfDate: new Date(),
            temp_sensors: [],
            temp_sensors_asOfDate: new Date(),
            gpios: [],
            gpios_asOfDate: new Date(),
            adcs: [],
            adcs_asOfDate: new Date(),
            pressure: undefined,
            pressure2: undefined,
            pressure3: undefined,
            pressure4: undefined,
            pressure_asOfDate: new Date
        };

        return result;
    }

    private assignPartialResults(status: SensorsStatus, partialResults: Partial<SensorsStatus>[]) {
        for (const partialResult of partialResults) {
            for (const prop of Object.getOwnPropertyNames(partialResult)) {
                status[prop] = partialResult[prop];
            }
        }
    }

    private async getTempSensorIds() {
        const sensorOptsPromise = this.sensorOptService.getSensorOpts();
        const sensorsPromise = this.tempSensorService.getSensors();

        const sensorOpts = await sensorOptsPromise;
        const sensorIds = await sensorsPromise;

        const result: SensorTempConnected[] = [];

        for (const sensorType of sensorTypes) {
            const tempSensor: SensorTempConnected = {
                sensor_id: undefined,
                sensor_type: sensorType,
                temperature: 0
            };
            const sensorOpt = sensorOpts.find(v => v.sensor_type === sensorType.id);
            if (sensorOpt) {
                tempSensor.sensor_id = sensorIds.find(v => v === sensorOpt.sensor_id);
            }

            if (tempSensor.sensor_id) {
                // if valid sensor.
                result.push(tempSensor);
            }
        }
        return result;
    }

    private async readTemperatures() {
        const sensors = await this.getTempSensorIds();
        const temperaturesPromises = sensors
            .filter(v => v.sensor_id)
            .map(v => {
                return {
                    value: this.tempSensorService.getTemperature(v.sensor_id),
                    sensor: v
                };
            });

        for (const tpv of temperaturesPromises) {
            try {
                const value = await tpv.value;
                tpv.sensor.temperature = value;
            } catch (err) {
                this.log.error('Error reading temp sensor: ' + err);
            }
        }

        return sensors.filter(s =>
            s.temperature !== undefined
            && s.temperature !== null
            && s.temperature !== 85.0);
    }
}
