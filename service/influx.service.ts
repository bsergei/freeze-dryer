import * as influx from 'influx';
import { injectable } from 'inversify';
import { Log } from './logger.service';
// import * as os from 'os';
import { SensorsStatus } from '../model/sensors-status.model';

@injectable()
export class InfluxService {

    private influxDb: influx.InfluxDB;
    // private lastCpuInfo: os.CpuInfo[] = [];

    constructor(
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
                },
                {
                    measurement: 'relay',
                    fields: {
                        value: influx.FieldType.BOOLEAN,
                    },
                    tags: [
                        'type'
                    ]
                },
                {
                    measurement: 'adc_volts',
                    fields: {
                        value: influx.FieldType.FLOAT,
                    },
                    tags: [
                        'type'
                    ]
                },
                {
                    measurement: 'pressure',
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

    public async writeSensorStatus(result: SensorsStatus) {

        const points: influx.IPoint[] = [];
        for (const sensorId of Object.getOwnPropertyNames(result.temp_sensors)) {
            const t = result.temp_sensors[sensorId];
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

        for (const gpio of result.gpios) {
            points.push({
                measurement: 'relay',
                tags: {
                    type: gpio.id
                },
                fields: {
                    value: gpio.value
                }
            });
        }

        for (let adcChannel = 0; adcChannel < result.adcs.length; adcChannel++) {
            points.push({
                measurement: 'adc_volts',
                tags: {
                    type: 'adc' + adcChannel
                },
                fields: {
                    value: result.adcs[adcChannel]
                }
            });
            points.push({
                measurement: 'pressure',
                tags: {
                    type: 'A' + adcChannel
                },
                fields: {
                    value: result.pressure[adcChannel]
                }
            });
        }

        // points.push({
        //     measurement: 'system',
        //     tags: {
        //         type: 'freemem'
        //     },
        //     fields: {
        //         value: os.freemem
        //     }
        // });
        // const cpuUsages = this.getCpuUsage();
        // for (let i = 0; i < cpuUsages.length; i++) {
        //     const cpuUsage = cpuUsages[i];
        //     points.push({
        //         measurement: 'system',
        //         tags: {
        //             type: 'cpuUsage' + i
        //         },
        //         fields: {
        //             value: cpuUsage
        //         }
        //     });
        // }

        await this.influxDb.writePoints(points, {
            database: 'holod',
            precision: 's'
        });
    }

    // private getCpuUsage() {
    //     const cpus = os.cpus();
    //     const result: number[] = [];

    //     if (this.lastCpuInfo.length === cpus.length) {
    //         for (let i = 0, len = cpus.length; i < len; i++) {
    //             const cpu = cpus[i];
    //             let total = this.getTotal(cpu) - this.getTotal(this.lastCpuInfo[i]);
    //             let user = cpu.times.user - this.lastCpuInfo[i].times.user;
    //             result.push(Math.round(100 * user / total));
    //         }
    //     }

    //     this.lastCpuInfo = cpus;
    //     return result;
    // }

    // private getTotal(cpu: os.CpuInfo) {
    //     let total = 0;
    //     for (const type of Object.getOwnPropertyNames(cpu.times)) {
    //         total += cpu.times[type];
    //     }
    //     return total;
    // }
}
