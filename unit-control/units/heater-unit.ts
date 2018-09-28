import { injectable } from 'inversify';
import { GpioUnit } from './gpio-unit';
import { Unit } from '../model/unit';

@injectable()
export class HeaterUnit implements Unit {
    constructor(private gpioUnit: GpioUnit) {
    }

    public getIsActive(): Promise<boolean> {
        return this.gpioUnit.getIsActive('heater');
    }

    public activate(): Promise<void> {
        return this.gpioUnit.activate('heater');
    }

    public deactivate(): Promise<void> {
        return this.gpioUnit.deactivate('heater');
    }
}
