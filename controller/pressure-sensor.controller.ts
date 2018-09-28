import {
    controller, httpGet
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { PressureSensorService } from '../service/pressure-sensor.service';

@controller('/api/pressure-sensor')
export class PressureSensorController {
    constructor(private pressureSensorService: PressureSensorService) {
    }

    @httpGet('/a0')
    public async getA0(request: Request, response: Response) {
        const value = await this.pressureSensorService.readPressure('A0');
        return {
            value: value
        };
    }

    @httpGet('/a1')
    public async getA1(request: Request, response: Response) {
        const value = await this.pressureSensorService.readPressure('A1');
        return {
            value: value
        };
    }
}
