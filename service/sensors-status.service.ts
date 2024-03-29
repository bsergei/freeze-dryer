import { injectable } from 'inversify';
import { TempSensorService } from './temp-sensor.service';
import { TempSensorOptService } from './temp-sensor-opt.service';
import { sensorTypes } from '../model/sensor-type.model';
import { SensorsStatus, SensorTempErrorObj } from '../model/sensors-status.model';
import { GpioService } from './gpio.service';
import { StorageService } from './storage.service';
import { AdcService } from './adc.service';
import { Log } from './logger.service';
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
        private log: Log) {
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
            const sensorTypesUsed = new Map<string, SensorOpt>();
            for (const sensorType of opts) {
                sensorTypesUsed.set(sensorType.sensor_type, sensorType);
            }

            let tempErrors: SensorTempErrorObj;

            await this.updateInCache(status => {
                if (!status.temp_sensors) {
                    status.temp_sensors = {};
                }
                const t = status.temp_sensors;

                if (!status.temp_errors) {
                    status.temp_errors = {};
                }
                const e = status.temp_errors;

                for (const sensorType of Object.getOwnPropertyNames(t)) {
                    if (!sensorTypesUsed.has(sensorType)) {
                        // Delete sensor id.
                        delete t[sensorType];
                        delete e[sensorType];
                    }
                }

                tempErrors = status.temp_errors;
                return status;
            });

            const errors: string[] = [];
            for (const opt of opts) {
                const canUpdate = this.canUpdateTemperature(opt, tempErrors);
                if (canUpdate) {
                    await this.updateTemperature(opt, errors);
                }
            }

            if (errors.length > 0) {
                for (const error of errors) {
                    this.log.error(error);
                }
            }
        } catch (err) {
            this.log.error(`Error reading temperatures: ${err}`, err);
        }
    }

    private canUpdateTemperature(opt: SensorOpt, tempErrors: SensorTempErrorObj) {
        if (tempErrors && tempErrors[opt.sensor_type]) {
            const currDate = new Date();
            const errDate = new Date(tempErrors[opt.sensor_type].ts);
            const elapsedSeconds = Math.abs(currDate.getTime() - errDate.getTime()) / (1000.0);
            if (elapsedSeconds < (2 * 60)) {
                return false;
            } else {
                this.log.info(`Retry to read ${opt.sensor_type}/${opt.sensor_id} sensor after error.`);
            }
        }
        return true;
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
            }
        } catch (e) {
            this.log.error(`Error in ${id}: writeSensors: ${e}`, e);
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
        result.pressure_ts = new Date();
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
        const sensorTypeId = opt.sensor_type;
        const sensorId = opt.sensor_id;
        const sensorType = sensorTypes.find(_ => _.id === sensorTypeId);

        let temperature: number = undefined;
        let error: string = undefined;
        try {
            temperature = await this.tempSensorService.getTemperature(sensorId);
        } catch (err) {
            error = `Error reading temperature for '${sensorTypeId}/${sensorId}': ${err}`;
        }

        await this.updateInCache(status => {
            if (!status.temp_sensors) {
                status.temp_sensors = {};
            }
            const t = status.temp_sensors;

            if (!status.temp_errors) {
                status.temp_errors = {};
            }
            const tempErrors = status.temp_errors;

            if (error === undefined || error === null) {
                delete tempErrors[sensorTypeId];
            } else {
                const currentError = tempErrors[sensorTypeId];
                if (!currentError || currentError.error !== error) {
                    errors.push(error);
                }
                tempErrors[sensorTypeId] = {
                    error: error,
                    ts: new Date().toString()
                };
            }

            if (temperature === undefined || temperature === null) {
                delete t[sensorTypeId];
            } else {
                t[sensorTypeId] = {
                    sensor_id: sensorTypeId,
                    sensor_type: sensorType,
                    temperature: temperature,
                    ts: new Date()
                };
            }

            return status;
        });

        await new Promise(r => setTimeout(r, 100));
    }

    private getEmptySensorsStatus() {
        const result: SensorsStatus = {
            ts: new Date(),
            temp_sensors: {},
            temp_errors: {},
            gpios: [],
            gpios_ts: new Date(),
            adcs: [],
            adcs_ts: new Date(),
            pressure: [],
            pressure_ts: new Date()
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
