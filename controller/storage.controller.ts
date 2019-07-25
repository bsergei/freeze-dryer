import {
    controller, httpDelete
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { StorageService } from '../service/storage.service';
import { TempSensorOptService } from '../service/temp-sensor-opt.service';

@controller('/api/storage')
export class StorageController {
    constructor(
        private storageService: StorageService,
        private tempSensorOptService: TempSensorOptService) {
    }

    @httpDelete('/:id')
    public async delete(request: Request, response: Response) {
        switch (request.params.id) {
            case 'all':
                await this.storageService.reset();
                break;

            case 'sensor-bindings':
                await this.tempSensorOptService.reset();
                break;
        }
    }
}
