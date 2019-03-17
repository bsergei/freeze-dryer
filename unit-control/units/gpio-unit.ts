import { GpioService } from '../../service/gpio.service';
import { injectable } from 'inversify';
import { Gpios } from '../../model/gpios.model';

@injectable()
export class GpioUnit {
    constructor(private gpioService: GpioService) {
    }

    public async getIsActive(id: Gpios): Promise<boolean> {
        return this.gpioService.get(this.gpioService.findPin(id).port);
    }

    public async activate(id: Gpios): Promise<void> {
        this.gpioService.set(this.gpioService.findPin(id).port, true);
    }

    public async deactivate(id: Gpios): Promise<void> {
        this.gpioService.set(this.gpioService.findPin(id).port, false);
    }
}
