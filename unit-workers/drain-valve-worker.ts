import { UnitWorker } from './unit-worker';
import { DrainValveUnit, UnitControllerResult } from '../unit-control';
import { injectable } from 'inversify';

@injectable()
export class DrainValveWorkerFactory {
    constructor(private drainValveUnit: DrainValveUnit) {
    }

    public create() {
        return new DrainValveWorker(this.drainValveUnit);
    }
}

export class DrainValveWorker implements UnitWorker {

    constructor(private drainValveUnit: DrainValveUnit) {
    }

    public getId(): string {
        return this.drainValveUnit.getId();
    }

    public async onStart(): Promise<void> {
        await this.drainValveUnit.activate();
    }

    public onTick(): Promise<UnitControllerResult> {
        return Promise.resolve(UnitControllerResult.Unchanged);
    }

    public async onStop(): Promise<void> {
        await this.drainValveUnit.deactivate();
    }
}
