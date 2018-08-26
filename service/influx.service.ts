import * as influx from 'influx';
import { injectable } from 'inversify';
import { SensorsStatusService } from './sensors-status.service';
import { Log } from './logger.service';
import * as os from 'os';

@injectable()
export class InfluxService {

    private influxDb: influx.InfluxDB;
    private lastCpuInfo: os.CpuInfo[] = [];

    constructor(
        private sensorsStatus: SensorsStatusService,
        private log: Log) {
        this.influxDb = new influx.InfluxDB({
            host: 'localhost',
            port: 8086,
            database: 'holod',
            username: 'holod',
            password: 'holod',
            schema: [
                {
                    measurement: 'temperature',
                    fields: {
                        value: influx.FieldType.FLOAT,
                    },
                    tags: [
                        'type'
                    ]
                }
            ]
        });

        this.log.info('InfluxService created');
    }

    public async writeSensorStatus() {
        const result = await this.sensorsStatus.getSensorsStatus();
        await this.sensorsStatus.saveInCache(result);

        const points: influx.IPoint[] = [];
        for (const t of result.temp_sensors) {
            points.push({
                measurement: 'temperature',
                tags: {
                    type: t.sensor_type.id
                },
                fields: {
                    value: t.temperature
                }
            });
        }

        if (points.length) {
            await this.influxDb.writeMeasurement('temperature', points);
        }

        const relayPoints: influx.IPoint[] = [];
        for (const gpio of result.gpios) {
            relayPoints.push({
                measurement: 'relay',
                tags: {
                    type: gpio.id
                },
                fields: {
                    value: gpio.value
                }
            });
        }

        if (relayPoints.length) {
            await this.influxDb.writeMeasurement('relay', relayPoints);
        }

        const adcsVoltsPoints: influx.IPoint[] = [];
        for (let adcChannel = 0; adcChannel < result.adcs.length; adcChannel++) {
            adcsVoltsPoints.push({
                measurement: 'adc_volts',
                tags: {
                    type: 'adc' + adcChannel
                },
                fields: {
                    value: result.adcs[adcChannel]
                }
            });
        }

        if (adcsVoltsPoints.length) {
            await this.influxDb.writeMeasurement('adc_volts', adcsVoltsPoints);
        }

        if (result.pressure !== undefined) {
            await this.influxDb.writeMeasurement('pressure', [
                {
                    measurement: 'pressure',
                    fields: {
                        value: result.pressure
                    }
                }
            ]);
        }

        const systemPoints: influx.IPoint[] = [];
        systemPoints.push({
                measurement: 'system',
                tags: {
                    type: 'freemem'
                },
                fields: {
                    value: os.freemem
                }
        });
        const cpuUsages = this.getCpuUsage();
        for (let i = 0; i < cpuUsages.length; i++) {
            const cpuUsage = cpuUsages[i];
            systemPoints.push({
                measurement: 'system',
                tags: {
                    type: 'cpuUsage' + i
                },
                fields: {
                    value: cpuUsage
                }
            });
        }
        await this.influxDb.writeMeasurement('system', systemPoints);
    }

    private getCpuUsage() {
        const cpus = os.cpus();
        const result: number[] = [];

        if (this.lastCpuInfo.length === cpus.length) {
            for (let i = 0, len = cpus.length; i < len; i++) {
                const cpu = cpus[i];
                let total = this.getTotal(cpu) - this.getTotal(this.lastCpuInfo[i]);
                let user = cpu.times.user - this.lastCpuInfo[i].times.user;
                result.push(Math.round(100 * user / total));
            }
        }

        this.lastCpuInfo = cpus;
        return result;
    }

    private getTotal(cpu: os.CpuInfo) {
        let total = 0;
        for (const type of Object.getOwnPropertyNames(cpu.times)) {
            total += cpu.times[type];
        }
        return total;
    }
}
