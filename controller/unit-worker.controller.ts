import { UnitWorkerService } from '../service/unit-worker.service';
import {
    controller, httpGet, httpPost
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { UnitWorkerId } from '../model';

@controller('/api/unit-worker')
export class UnitWorkerController {
    constructor(
        private unitWorkerService: UnitWorkerService) {
    }

    @httpGet('/status')
    public getStatus(req: Request, resp: Response) {
        const result = this.unitWorkerService.getStatus();
        return result;
    }

    @httpGet('/params')
    public async getParams(req: Request, resp: Response) {
        const result = await this.unitWorkerService.getLastStoredParams();
        return result;
    }

    @httpGet('/stop-all')
    public async stopAll(req: Request, resp: Response) {
        await this.unitWorkerService.removeAll();
    }

    @httpPost('/start/:id')
    public async startWorker(req: Request, resp: Response) {
        const id = req.params.id as UnitWorkerId;
        const param = req.body;

        this.unitWorkerService.add(id, param);
    }

    @httpPost('/stop/:id')
    public async stopWorker(req: Request, resp: Response) {
        const id = req.params.id as UnitWorkerId;
        await this.unitWorkerService.remove(id);
    }
}
