import { UnitController, Unit, StateSwitchChecker, StateSwitchGuard } from '../unit-control';
import { UnitWorkerId } from '../model';
import { BaseUnitWorkerParams } from '../model/unit-worker-params.model';

export class UnitWorker<T extends UnitWorkerId = UnitWorkerId> extends UnitController {

    constructor(
        public kind: T,
        unit: Unit,
        stateSwitchChecker: StateSwitchChecker,
        stateSwitchGuard: StateSwitchGuard,
        private p: BaseUnitWorkerParams
    ) {
        super(unit, stateSwitchChecker, stateSwitchGuard);
    }

    public async onStart() {
        await this.unit.activate();
        this.lastActivated = UnitController.now();
        this.start();
    }

    public onTick() {
        return this.tick();
    }

    public async onStop() {
        this.stop();
        await this.unit.deactivate();
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
