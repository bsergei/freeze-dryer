import {
    controller, httpGet
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { GpioService } from '../service/gpio.service';

export interface Gpio {
    id: string,
    state: boolean
}

@controller('/api/gpio')
export class GpioController {
    constructor(private gpioService: GpioService) {
    }

    @httpGet('/all')
    public async getAll(request: Request, response: Response) {
        return this.gpioService.getAll();
    }

    @httpGet('/port/:id')
    public async getById(request: Request, response: Response) {
        return this.gpioService.get(Number(request.params.id));
    }

    @httpGet('/port/:id/:value')
    public async update(request: Request, response: Response) {
        const value = request.params.value;
        let boolValue: boolean;
        if (value == 1) {
            boolValue = true;
        } else if (value == 0) {
            boolValue = false;
        }

        if (boolValue === undefined) {
            return;
        }

        this.gpioService.set(Number(request.params.id), boolValue);
    }
}