import { UnitWorkerService } from '../service/unit-worker.service';
import {
    controller, httpGet, httpPost
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { CompressorWorkerFactory } from '../unit-workers/compressor-worker';
import { VacuumWorkerFactory } from '../unit-workers/vacuum-worker';
import { HeaterWorkerFactory } from '../unit-workers/heater-worker';
import { Gpios } from '../service/gpio.service';
import { CompressorWorkerParams } from '../model/compressor-worker-params.model';
import { VacuumWorkerParams } from '../model/vacuum-worker-params.model';
import { HeaterWorkerParams } from '../model/heater-worker-params.model';

@controller('/api/unit-worker')
export class UnitWorkerController {
    constructor(
        private unitWorkerService: UnitWorkerService,
        private compressorWorkerFactory: CompressorWorkerFactory,
        private vacuumWorkerFactory: VacuumWorkerFactory,
        private heaterWorkerFactory: HeaterWorkerFactory) {
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
                await this.addCompressor(param);
                break;

            case 'vacuum':
                await this.addVacuum(param);
                break;

            case 'heater':
                await this.addHeater(param);
                break;
        }
    }

    @httpPost('/stop/:id')
    public async stopWorker(req: Request, resp: Response) {
        const id = req.params.id as string;
        await this.unitWorkerService.stop(id);
    }

    private async addCompressor(param: CompressorWorkerParams) {
        const unitWorker = this.compressorWorkerFactory.create(param);
        await this.unitWorkerService.add(unitWorker);
    }

    private async addVacuum(param: VacuumWorkerParams) {
        const unitWorker = this.vacuumWorkerFactory.create(param);
        await this.unitWorkerService.add(unitWorker);
    }

    private async addHeater(param: HeaterWorkerParams) {
        const unitWorker = this.heaterWorkerFactory.create(param);
        await this.unitWorkerService.add(unitWorker);
    }
}
