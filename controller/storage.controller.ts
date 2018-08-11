import {
    controller, httpDelete
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { StorageService } from '../service/storage.service';

@controller('/api/storage')
export class StorageController {
    constructor(
        private storageService: StorageService) {
    }

    @httpDelete('/:id')
    public async delete(request: Request, response: Response) {
        if (request.params.id === 'all') {
            this.storageService.reset();
        }
    }
}
