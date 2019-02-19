import { injectable } from 'inversify';
import { TempSensorService } from './temp-sensor.service';
import { TempSensorOptService } from './temp-sensor-opt.service';
import { sensorTypes } from '../model/sensor-type.model';
import { SensorsStatus } from '../model/sensors-status.model';
import { GpioService } from './gpio.service';
import { StorageService } from './storage.service';
import { AdcService } from './adc.service';
import { Log } from './logger.service';
import { NotifyService } from './notify.service';
import { SensorOpt } from '../model';
import { PressureInterpolatorService } from './pressure-interpolator.service';

const storageSensorStatusKey = 'storage:sensor-status';

@injectable()
export class SensorsStatusService {

    constructor(
        private tempSensorService: TempSensorService,
        private sensorOptService: TempSensorOptService,
        private gpioService: GpioService,
        private adcService: AdcService,
        private pressureService: PressureInterpolatorService,
        private storageService: StorageService,
        private log: Log,
        private notifyService: NotifyService) {
    }

    public async getFromCache() {
        await this.storageService.isConnected;
        const result = await this.storageService.get<SensorsStatus>(storageSensorStatusKey);
        return result || this.getEmptySensorsStatus();
    }

    public async updateGpioSensors() {
        await this.writeSensors(
            'child.sensors.gpios',
            errors => [this.getGpios(errors)]);
    }

    public async updatePressureSensors() {
        await this.writeSensors(
            'child.sensors.pressure',
            errors => [
                this.getAdcsAndPressure(errors)
            ]);
    }

    public async updateTemperatureSensors() {
        try {
            const opts = await this.sensorOptService.getSensorOpts();
            const sensorTypes = new Map<string, SensorOpt>();
            for (const sensorType of opts) {
                sensorTypes.set(sensorType.sensor_type, sensorType);
            }

            await this.updateInCache(status => {
                const t = status.temp_sensors;
                for (const sensorType of Object.getOwnPropertyNames(t)) {
                    if (!sensorTypes.has(sensorType)) {
                        // Delete sensor id.
                        delete t[sensorType];
                    }
                }
                return status;
            });

            const errors: string[] = [];
            for (const opt of opts) {
                await this.updateTemperature(opt, errors);
            }

            if (errors.length > 0) {
                for (const error of errors) {
                    console.log(error);
                }
                this.notifyService.error(errors);
            }
        } catch (err) {
            this.log.error(`Error reading temperatures: ${err}`);
        }
    }

    private async writeSensors(
        id: string,
        results: (errors: string[]) => Promise<Partial<SensorsStatus>>[]) {
        try {
            const errors: string[] = [];
            const partialResults = await Promise.all(results(errors));
            await this.updateInCacheWithPartialResults(partialResults);
            if (errors.length > 0) {
                for (const error of errors) {
                    this.log.error(`Error in ${id}: writeSensors: ${error}`);
                }
                this.notifyService.error(errors);
            }
        } catch (e) {
            this.log.error(`Error in ${id}: writeSensors: ${e}`);
        }
    }

    private async getGpios(errors: string[]) {
        const result: Partial<SensorsStatus> = {};
        result.gpios_ts = new Date();
        try {
            result.gpios = this.gpioService.getAll();
        } catch (err) {
            result.gpios = [];
            const errorStr = 'Sensor Status: GPIO read error: ' + err;
            errors.push(errorStr);
        }
        return result;
    }

    private async getAdcsAndPressure(errors: string[]) {
        const result: Partial<SensorsStatus> = {};
        result.adcs_ts = new Date();
        try {
            const adcsPromise =
                Promise.all([
                    this.adcService.readAdc('A0'),
                    this.adcService.readAdc('A1'),
                    this.adcService.readAdc('A2'),
                    this.adcService.readAdc('A3')
                ]);
            result.adcs = await adcsPromise;
            result.pressure = [
                this.pressureService.getPressure('A0', result.adcs[0]),
                this.pressureService.getPressure('A1', result.adcs[1]),
                this.pressureService.getPressure('A2', result.adcs[2]),
                this.pressureService.getPressure('A3', result.adcs[3]),
            ];
        } catch (err) {
            result.adcs = [];
            result.pressure = [];
            const errorStr = 'Sensor Status: ADCs read error: ' + err;
            errors.push(errorStr);
        }
        return result;
    }

    private updateInCacheWithPartialResults(partialResults: Partial<SensorsStatus>[]) {
        return this.updateInCache(r => this.assignPartialResults(r, partialResults));
    }

    private updateInCache(func: (v: SensorsStatus) => SensorsStatus) {
        return this.storageService.updateWithLock<SensorsStatus>(storageSensorStatusKey,
            result => {
                if (!result) {
                    result = this.getEmptySensorsStatus();
                }
                result = func(result);
                result.ts = new Date();

                // Publish updated result.
                this.storageService.publish('sensors-status', result);

                return result;
            },
            false);
    }

    private async updateTemperature(opt: SensorOpt, errors: string[]) {
        const sensorId = opt.sensor_id;
        const sensorType = sensorTypes.find(_ => _.id === sensorId);

        let temperature: number = undefined;
        try {
            temperature = await this.tempSensorService.getTemperature(sensorId);
        } catch (err) {
            errors.push(`Error reading temperature for '${sensorId}/${opt.sensor_type}': ${err}`);
        }

        await this.updateInCache(status => {
            const t = status.temp_sensors;

            if (temperature === undefined || temperature === null) {
                delete t[opt.sensor_type];
            } else {
                t[opt.sensor_type] = {
                    sensor_id: sensorId,
                    sensor_type: sensorType,
                    temperature: temperature,
                    ts: new Date
                }
            }

            return status;
        });

        await new Promise(r => setTimeout(r, 100));
    }

    private getEmptySensorsStatus() {
        const result: SensorsStatus = {
            ts: new Date(),
            temp_sensors: {},
            gpios: [],
            gpios_ts: new Date(),
            adcs: [],
            adcs_ts: new Date(),
            pressure: [],
            pressure_ts: new Date
        };

        return result;
    }

    private assignPartialResults(status: SensorsStatus, partialResults: Partial<SensorsStatus>[]) {
        for (const partialResult of partialResults) {
            for (const prop of Object.getOwnPropertyNames(partialResult)) {
                status[prop] = partialResult[prop];
            }
        }
        return status;
    }
}
