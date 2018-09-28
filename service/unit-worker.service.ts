import { injectable } from 'inversify';
import { UnitWorker } from '../unit-workers/unit-worker';
import {
    UnitWorkerStatus,
    UnitWorkerParams,
    UnitWorkerId
} from '../model/unit-worker-status.model';
import { Log } from './logger.service';
import { StorageService } from './storage.service';

@injectable()
export class UnitWorkerService {
    private unitWorkers: UnitWorker[] = [];

    constructor(
        private log: Log,
        private storageService: StorageService) {
        log.info('UnitWorkerService created');
        this.run();
    }

    public async add<T extends UnitWorkerId>(unitWorker: UnitWorker<T>) {
        if (this.findUnitWorkerIdx(unitWorker.kind) >= 0) {
            return;
        }
        await unitWorker.onStart();
        this.unitWorkers.push(unitWorker);

        const storageKey = this.getParamsStorageKey();
        const lastParams = await this.storageService.get<UnitWorkerParams>(storageKey);
        lastParams[unitWorker.kind] = unitWorker.getParams();
        await this.storageService.set(storageKey, lastParams);
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

    public async remove(id: UnitWorkerId) {
        const idx = this.findUnitWorkerIdx(id);
        if (idx >= 0) {
            const unitWorker = this.unitWorkers[idx];
            this.unitWorkers.splice(idx, 1);

            await unitWorker.onStop();
        }
    }

    public getStatus(): UnitWorkerStatus {
        const res =  {
            runningIds: this.unitWorkers.map(w => w.kind),
            params: {}
        };

        for (let unitWorker of this.unitWorkers) {
            res.params[unitWorker.kind] = {
                p: unitWorker.getParams(),
                heartbeat: unitWorker.getLastUpdated(),
                startedTime: unitWorker.getStartedTime()
            };
        }

        return res;
    }

    public async run() {
        try {
            await this.tick();
        } catch (e) {
            this.log.error(`Error in UnitWorkerService.run: ${e}`);
        }
        setTimeout(() => this.run(), 5000);
    }

    public async getLastStoredParams() {
        return await this.storageService.get<UnitWorkerParams>(this.getParamsStorageKey());
    }

    private async tick() {
        const currWorkers = this.unitWorkers.slice();
        this.log.info(`UnitWorkerService.tick: ${currWorkers.length}/${this.unitWorkers.length}`);
        for (const unitWorker of currWorkers) {
            try {
                await unitWorker.onTick();
            } catch (e) {
                this.log.error(`Error in UnitWorkerService.tick: ${e}`);
            }
        }
    }

    private findUnitWorkerIdx(id: UnitWorkerId) {
        const idx = this.unitWorkers.findIndex(v => v.kind === id);
        return idx;
    }

    private getParamsStorageKey() {
        return `unit-worker:params`;
    }
}
