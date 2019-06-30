import { SensorsStatus } from '../../model/sensors-status.model';

export class WfVacuumContext {
    constructor(private sensors: SensorsStatus) {
    }

    public get A0() {
        return this.sensors.pressure[0];
    }

    public get A1() {
        return this.sensors.pressure[1];
    }
}
