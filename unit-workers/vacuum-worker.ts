import {
    VacuumUnit,
    PressureParam,
    UnitController,
    UnitParamReducer
} from '../unit-control';

import { UnitWorker } from './unit-worker';
import { injectable } from 'inversify';

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

export interface VacuumWorkerParams {
    targetPressure: number;
    histeresis: number;
}

export class VacuumWorker extends UnitController implements UnitWorker {

    constructor(
        private vacuumUnit: VacuumUnit,
        pressureParam: PressureParam,
        p: VacuumWorkerParams) {
        super(
            vacuumUnit,
            new UnitParamReducer(
                pressureParam,
                p.targetPressure,
                p.histeresis)
        );
    }

    public getId(): string {
        return this.vacuumUnit.getId();
    }

    public async onStart() {
        await this.vacuumUnit.activate();
        this.lastActivated = UnitController.now();
        this.start();
    }

    public async onTick() {
        return await this.tick();
    }

    public async onStop() {
        this.stop();
        await this.vacuumUnit.deactivate();
        this.lastDeactivated = UnitController.now();
    }
}