import { Unit } from '../model/unit';
import { GpioService, GpioDescriptor, Gpios } from '../../service/gpio.service';

export class GpioUnit implements Unit {
    private pin: GpioDescriptor;

    constructor(private gpioService: GpioService, private id: Gpios) {
        this.pin = gpioService.findPin(id);
    }

    public getId(): string {
        return this.id;
    }

    public async getIsActive(): Promise<boolean> {
        return this.gpioService.get(this.pin.port);
    }

    public async activate(): Promise<void> {
        this.gpioService.set(this.pin.port, true);
    }

    public async deactivate(): Promise<void> {
        this.gpioService.set(this.pin.port, false);
    }
}
