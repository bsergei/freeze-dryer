import {
    controller, httpDelete
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { Request, Response } from 'express';
import TYPES from '../constant/types';
import { StorageService } from '../service/storage.service';

@controller('/api/storage')
export class StorageController {
    constructor(
        @inject(TYPES.StorageService) private storageService: StorageService) {
    }

    @httpDelete('/:id')
    public async delete(request: Request, response: Response) {
        if (request.params.id === 'all') {
            this.storageService.reset();
        }
    }
}