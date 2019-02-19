import { injectable } from 'inversify';
import { ControllableParam } from '../model/controllable-param';
import { SensorsStatusService } from '../../service/sensors-status.service';
import { TempSensorTypeId } from '../../model';

export class TemperatureParam implements ControllableParam {

    constructor(
        private sensorStatus: SensorsStatusService,
        private sensorTypeId: TempSensorTypeId) {
    }

    public async readParamValue(): Promise<number> {
        const sensorStatus = await this.sensorStatus.getFromCache();
        const sensor = sensorStatus.temp_sensors[this.sensorTypeId];

        if (sensor === undefined ||
            sensor === null) {
            return undefined;
        }

        return sensor.temperature;
    }
}

@injectable()
export class TemperatureParamFactory {
    constructor(private sensorStatus: SensorsStatusService) {
    }

    public create(sensorTypeId: TempSensorTypeId) {
        return new TemperatureParam(this.sensorStatus, sensorTypeId);
    }
}
