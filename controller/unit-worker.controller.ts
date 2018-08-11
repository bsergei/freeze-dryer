import { UnitWorkerService } from '../service/unit-worker.service';
import {
    controller, httpGet, httpPost
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { CompressorWorkerFactory, CompressorWorkerParams } from '../unit-workers/compressor-worker';
import { VacuumWorkerFactory, VacuumWorkerParams } from '../unit-workers/vacuum-worker';
import { HeaterWorkerFactory, HeaterWorkerParams } from '../unit-workers/heater-worker';
import { DrainValveWorkerFactory } from '../unit-workers/drain-valve-worker';
import { Gpios } from '../service/gpio.service';

@controller('/api/unit-worker')
export class UnitWorkerController {
    constructor(
        private unitWorkerService: UnitWorkerService,
        private compressorWorkerFactory: CompressorWorkerFactory,
        private vacuumWorkerFactory: VacuumWorkerFactory,
        private heaterWorkerFactory: HeaterWorkerFactory,
        private drainValveWorkerFactory: DrainValveWorkerFactory) {
    }

    @httpGet('/status')
    public getStatus(req: Request, resp: Response) {
        let result = this.unitWorkerService.getStatus();
        return result;
    }

    @httpGet('/stop-all')
    public async stopAll(req: Request, resp: Response) {
        await this.unitWorkerService.stopAll();
    }

    @httpPost('/start/:id')
    public async startWorker(req: Request, resp: Response) {
        const id = req.params.id as Gpios;
        const param = req.body;

        switch (id) {
            case 'compressor':
                this.addCompressor(param);
                break;

            case 'vacuum':
                this.addVacuum(param);
                break;

            case 'heater':
                this.addHeater(param);
                break;

            case 'drain_valve':
                this.addDrainValve(param);
                break;
        }
    }

    @httpPost('/stop/:id')
    public async stopWorker(req: Request, resp: Response) {
        const id = req.params.id as string;
        this.unitWorkerService.stop(id);
    }

    private addCompressor(param: CompressorWorkerParams) {
        const unitWorker = this.compressorWorkerFactory.create(param);
        this.unitWorkerService.add(unitWorker);
    }

    private addVacuum(param: VacuumWorkerParams) {
        const unitWorker = this.vacuumWorkerFactory.create(param);
        this.unitWorkerService.add(unitWorker);
    }

    private addHeater(param: HeaterWorkerParams) {
        const unitWorker = this.heaterWorkerFactory.create(param);
        this.unitWorkerService.add(unitWorker);
    }

    private addDrainValve(_param) {
        const unitWorker = this.drainValveWorkerFactory.create();
        this.unitWorkerService.add(unitWorker);
    }
}
