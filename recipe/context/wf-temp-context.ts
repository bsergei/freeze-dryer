import { SensorsStatus } from '../../model';

export class WfTempContext {
    constructor(sensors: SensorsStatus) {
        for (const key of Object.getOwnPropertyNames(sensors.temp_sensors)) {
            this[key] = sensors.temp_sensors[key];
        }
    }
}
