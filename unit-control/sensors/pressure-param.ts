import { injectable } from 'inversify';
import { ControllableParam } from '../model/controllable-param';
import { PressureSensorService } from '../../service/pressure-sensor.service';

@injectable()
export class PressureParam implements ControllableParam {

    constructor(private pressureService: PressureSensorService) {
    }

    public readParamValue(): Promise<number> {
        return this.pressureService.readPressure('A0');
    }
}
