import {
    controller, httpGet, httpPost
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { SensorOpt } from '../model/sensor-opt.model';
import { TempSensorOptService } from '../service/temp-sensor-opt.service';

@controller('/api/sensor/opt')
export class SensorOptController {
    constructor(
        private tempSensorOptService: TempSensorOptService) {
    }

    @httpGet('/')
    public async getSensorOpts() {
        return this.tempSensorOptService.getSensorOpts();
    }

    @httpGet('/:id')
    public async getSensorOpt(request: Request, response: Response) {
        const item = await this.tempSensorOptService.getSensorOpt(request.params.id);
        if (item) {
            return item;
        } else {
            response.status(404);
        }
    }

    @httpPost('/')
    public async addOrUpdate(request: Request) {
        const validated = this.getValidatedItemFromBody(request);
        await this.tempSensorOptService.addOrUpdateSensorOpt(validated);
        return validated;
    }

    private getValidatedItemFromBody(request: Request) {
        const newItem = request.body;
        const validated: SensorOpt = {
            sensor_id: newItem.sensor_id,
            sensor_type: newItem.sensor_type
        };

        return validated;
    }
}
