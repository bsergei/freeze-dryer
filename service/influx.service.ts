import * as influx from 'influx';
import { injectable } from 'inversify';
import { SensorsStatusService } from './sensors-status.service';

@injectable()
export class InfluxService {

    private influxDb: influx.InfluxDB;

    constructor(
        private sensorsStatus: SensorsStatusService) {
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

        console.log('InfluxService created');
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
    }
}
