import { injectable } from '../node_modules/inversify';
import { UnitWorker } from '../unit-workers/unit-worker';
import { UnitWorkerStatus } from '../model/unit-worker-status.model';
import { Log } from './logger.service';

@injectable()
export class UnitWorkerService {
    private unitWorkers: UnitWorker[] = [];

    constructor(private log: Log) {
    }

    public async add(unitWorker: UnitWorker) {
        if (this.findUnitWorkerIdx(unitWorker.getId()) >= 0) {
            return;
        }
        await unitWorker.onStart();
        this.unitWorkers.push(unitWorker);
    }

    public async removeAll() {
        const unitWorkers = this.unitWorkers;
        this.unitWorkers = [];

        for (const unitWorker of unitWorkers) {
            try {
                await unitWorker.onStop();
            } catch (e) {
                this.log.error(`Error in UnitWorkerService.removeAll: ${e}`);
            }
        }
    }

    public async remove(id: string) {
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

    public async run() {
        try {
            await this.tick();
        } catch (e) {
            this.log.error(`Error in UnitWorkerService.run: ${e}`);
        }
        setTimeout(() => this.run(), 1000);
    }

    private async tick() {
        const currWorkers = this.unitWorkers.slice();
        for (const unitWorker of currWorkers) {
            try {
                await unitWorker.onTick();
            } catch (e) {
                this.log.error(`Error in UnitWorkerService.tick: ${e}`);
            }
        }
    }

    private findUnitWorkerIdx(id: string) {
        const idx = this.unitWorkers.findIndex(v => v.getId() === id);
        return idx;
    }
}
