import { injectable } from 'inversify';
import { GpioService } from '../../service/gpio.service';
import { GpioUnit } from './gpio-unit';

@injectable()
export class HeaterUnit extends GpioUnit {
    constructor(gpioService: GpioService) {
        super(gpioService, 'heater');
    }
}
