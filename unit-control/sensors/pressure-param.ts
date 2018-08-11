import { injectable } from 'inversify';
import { ControllableParam } from '../model/controllable-param';
import { SensorsStatusService } from '../../service/sensors-status.service';

@injectable()
export class PressureParam implements ControllableParam {

    constructor(private sensorStatus: SensorsStatusService) {
    }

    public async readParamValue(): Promise<number> {
        const sensorStatus = await this.sensorStatus.getFromCache();
        const value = sensorStatus
            .pressure;
        return value;
    }
}
