import {
    VacuumUnit,
    PressureParam,
    UnitController,
    UnitParamReducer
} from '../unit-control';

import { UnitWorker } from './unit-worker';
import { injectable } from 'inversify';
import { VacuumWorkerParams } from '../model/vacuum-worker-params.model';

@injectable()
export class VacuumWorkerFactory {
    constructor(
        private vacuumUnit: VacuumUnit,
        private pressureParam: PressureParam) {

    }

    public create(p: VacuumWorkerParams) {
        return new VacuumWorker(this.vacuumUnit,
            this.pressureParam,
            p);
    }
}

export class VacuumWorker extends UnitController implements UnitWorker<'vacuum'> {

    public kind: 'vacuum' = 'vacuum';

    constructor(
        private vacuumUnit: VacuumUnit,
        pressureParam: PressureParam,
        private p: VacuumWorkerParams) {
        super(
            vacuumUnit,
            new UnitParamReducer(
                pressureParam,
                p.targetPressure,
                p.histeresis)
        );
    }

    public async onStart() {
        await this.vacuumUnit.activate();
        this.lastActivated = UnitController.now();
        this.start();
    }

    public onTick() {
        return this.tick();
    }

    public async onStop() {
        this.stop();
        await this.vacuumUnit.deactivate();
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
