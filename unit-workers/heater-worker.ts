import {
    UnitController,
    HeaterUnit,
    TemperatureParamFactory,
    UnitParamIncreaser,
    AggregatedSwitchChecker
} from '../unit-control';

import { UnitWorker } from './unit-worker';
import { injectable } from 'inversify';
import { HeaterWorkerParams } from '../model/heater-worker-params.model';

@injectable()
export class HeaterWorkerFactory {
    constructor(
        private heaterUnit: HeaterUnit,
        private tempParamFactory: TemperatureParamFactory) {
    }

    public create(p: HeaterWorkerParams) {
        return new HeaterWorker(
            this.heaterUnit,
            this.tempParamFactory,
            p);
    }
}

export class HeaterWorker extends UnitController implements UnitWorker {

    constructor(
        private heaterUnit: HeaterUnit,
        tempParamFactory: TemperatureParamFactory,
        private p: HeaterWorkerParams) {

        super(
            heaterUnit,
            new AggregatedSwitchChecker(
                ...p.tempSensors.map(ts => new UnitParamIncreaser(
                    tempParamFactory.create(ts.tempSensor),
                    ts.targetTemperature,
                    p.histeresis))
            )
        );
    }

    public getId(): string {
        return this.heaterUnit.getId();
    }

    public async onStart() {
        await this.heaterUnit.activate();
        this.lastActivated = UnitController.now();
        this.start();
    }

    public onTick() {
        return this.tick();
    }

    public async onStop() {
        this.stop();
        await this.heaterUnit.deactivate();
        this.lastDeactivated = UnitController.now();
    }

    public getParams() {
        return this.p;
    }

    public getLastUpdated() {
        return this.lastUpdated;
    }

    public getStartedTime() {
        return this.startedTime;
    }
}
