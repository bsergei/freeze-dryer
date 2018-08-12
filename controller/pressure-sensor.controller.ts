import {
    controller, httpGet
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { PressureSensorService } from '../service/pressure-sensor.service';

@controller('/api/pressure-sensor')
export class PressureSensorController {
    constructor(private pressureSensorService: PressureSensorService) {
    }

    @httpGet('/')
    public async get(request: Request, response: Response) {
        const value = await this.pressureSensorService.readPressure();
        return {
            value: value
        };
    }
}
