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
import { Log } from '../service/logger.service';

@injectable()
export class HeaterWorkerFactory {
    constructor(
        private heaterUnit: HeaterUnit,
        private tempParamFactory: TemperatureParamFactory,
        private log: Log) {
    }

    public create(p: HeaterWorkerParams) {
        return new HeaterWorker(
            this.heaterUnit,
            this.tempParamFactory,
            this.log,
            p);
    }
}

export class HeaterWorker extends UnitController implements UnitWorker<'heater'> {

    public kind: 'heater' = 'heater';

    constructor(
        private heaterUnit: HeaterUnit,
        tempParamFactory: TemperatureParamFactory,
        private log: Log,
        private p: HeaterWorkerParams) {

        super(
            heaterUnit,
            new AggregatedSwitchChecker(
                ...p.tempSensors.map(ts => new UnitParamIncreaser(
                    tempParamFactory.create(ts.tempSensor),
                    ts.targetTemperature,
                    p.histeresis,
                    log))
            )
        );
    }

    public async onStart() {
        this.log.info('HeaterWorker: Starting Heater unit worker...');
        await this.heaterUnit.activate();
        this.lastActivated = UnitController.now();
        this.start();
    }

    public onTick() {
        this.log.info('HeaterWorker: Checking Heater unit worker...');
        return this.tick();
    }

    public async onStop() {
        this.log.info('HeaterWorker: Stopping Heater unit worker...');
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
