import {
    controller, httpGet, httpPost, httpPut, httpDelete
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { Request, Response } from 'express';
import TYPES from '../constant/types';
import { StorageService } from '../service/storage.service';
import { SensorOpt } from '../model/sensor-opt.model';

const StorageSensorOptsKey = 'storage:sensor-opts';

@controller('/sensort-opt')
export class SensorOptController {
    constructor(@inject(TYPES.StorageService) private storageService: StorageService) {
    }

    @httpGet('/')
    public async getSensorOpts() {
        await this.storageService.isConnected;
        return (await this.storageService.get<SensorOpt[]>(StorageSensorOptsKey)) || [];
    }

    @httpGet('/:id')
    public async getSensorOpt(request: Request, response: Response) {
        await this.storageService.isConnected;
        const result = (await this.storageService.get<SensorOpt[]>(StorageSensorOptsKey)) || [];
        const item = result.find(v => v.sensor_id === request.params.id);
        if (item) {
            return item;
        } else {
            response.status(404);
        }
    }

    @httpPost('/')
    public async newSensorOpt(request: Request) {
        await this.storageService.isConnected;
        const result = (await this.storageService.get<SensorOpt[]>(StorageSensorOptsKey)) || [];
        const validated = this.getValidatedItemFromBody(request);

        if (validated.sensor_id) {
            result.push(validated);
            await this.storageService.set<SensorOpt[]>(StorageSensorOptsKey, result);
        }

        return validated;
    }

    @httpPut('/:id')
    public async updateSensorOpt(request: Request, response: Response) {
        await this.storageService.isConnected;
        const result = (await this.storageService.get<SensorOpt[]>(StorageSensorOptsKey)) || [];
        const item =  result.find(v => v.sensor_id === request.params.id);
        if (item) {
            const validated = this.getValidatedItemFromBody(request);
            item.display_name = validated.display_name;
            item.connection_id = validated.connection_id;
            await this.storageService.set<SensorOpt[]>(StorageSensorOptsKey, result);
            return item;
        } else {
            response.status(404);
        }
    }

    @httpDelete('/:id')
    public async deleteUser(request: Request, response: Response) {
        await this.storageService.isConnected;
        const result = (await this.storageService.get<SensorOpt[]>(StorageSensorOptsKey)) || [];
        const item =  result.find(v => v.sensor_id === request.params.id);
        if (item) {
            const newResult = result.filter(i => i !== item);
            await this.storageService.set<SensorOpt[]>(StorageSensorOptsKey, newResult);
            return item;
        } else {
            response.status(404);
        }
    }

    private getValidatedItemFromBody(request: Request) {
        const newItem = request.body;
        const validated: SensorOpt = {
            sensor_id: newItem.sensor_id,
            display_name: newItem.display_name,
            connection_id: newItem.connection_id
        };

        return validated;
    }
}