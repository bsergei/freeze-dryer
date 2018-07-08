import {
    controller, httpGet
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { GpioService } from '../service/gpio.service';
import { inject } from 'inversify';
import TYPES from '../constant/types';

export interface Gpio {
    id: string,
    state: boolean
}

@controller('/api/gpio')
export class GpioController {
    constructor(@inject(TYPES.GpioService) private gpioService: GpioService) {
    }

    @httpGet('/:id')
    public async getById(request: Request, response: Response) {
        return this.gpioService.read(request.params.id);
    }

    @httpGet('/:id/:value')
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

        this.gpioService.switch(request.params.id, boolValue);
    }
}