import {
    controller, httpGet, httpPut
} from 'inversify-express-utils';
import { Request, Response } from 'express';

export interface Gpio {
    id: string,
    state: boolean
}

@controller('/api/gpio')
export class GpioController {
    constructor() {
    }

    @httpGet('/')
    public async get() {
    }

    @httpGet('/:id')
    public async getById(request: Request, response: Response) {
    }

    @httpPut('/:id')
    public async update(request: Request, response: Response) {
    }
}