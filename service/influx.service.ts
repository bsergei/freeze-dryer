import * as influx from "influx";
import { injectable, inject } from "inversify";
import { SensorsStatusService } from "./sensors-status.service";
import TYPES from "../constant/types";

@injectable()
export class InfluxService {

    private influxDb: influx.InfluxDB;

    constructor(
        @inject(TYPES.SensorsStatusService) private sensorsStatus: SensorsStatusService) {
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
    }

    public async writeTemperatures() {
        var result = await this.sensorsStatus.getSensorsStatus();

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
            await this.influxDb.writeMeasurement('temperature', points)
        }
    };
}