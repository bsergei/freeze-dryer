import { injectable } from '../node_modules/inversify';
import { UnitWorker } from '../unit-workers/unit-worker';
import { UnitWorkerStatus } from '../model/unit-worker-status.model';

@injectable()
export class UnitWorkerService {
    private unitWorkers: UnitWorker[] = [];

    public async add(unitWorker: UnitWorker) {
        if (this.findUnitWorkerIdx(unitWorker.getId()) >= 0) {
            return;
        }
        await unitWorker.onStart();
        this.unitWorkers.push(unitWorker);
    }

    public async stopAll() {
        const unitWorkers = this.unitWorkers;
        this.unitWorkers = [];

        for (const unitWorker of unitWorkers) {
            try {
                await unitWorker.onStop();
            } catch (e) {
                console.log(e);
            }
        }
    }

    public async stop(id: string) {
        const idx = this.findUnitWorkerIdx(id);
        if (idx >= 0) {
            const unitWorker = this.unitWorkers[idx];
            this.unitWorkers.splice(idx, 1);

            await unitWorker.onStop();
        }
    }

    public getStatus(): UnitWorkerStatus {
        return {
            runningIds: this.unitWorkers.map(w => w.getId())
        };
    }

    public async tick() {
        const currWorkers = this.unitWorkers.slice();
        for (const unitWorker of currWorkers) {
            try {
                await unitWorker.onTick();
            } catch (e) {
                console.log(e);
            }
        }
    }

    private findUnitWorkerIdx(id: string) {
        const idx = this.unitWorkers.findIndex(v => v.getId() === id);
        return idx;
    }
}
