import { injectable } from 'inversify';
import { GpioUnit } from './gpio-unit';
import { Unit } from '../model/unit';

@injectable()
export class ThawingUnit implements Unit {
    constructor(private gpioUnit: GpioUnit) {
    }

    public getIsActive(): Promise<boolean> {
        return this.gpioUnit.getIsActive('thawing');
    }

    public activate(): Promise<void> {
        return this.gpioUnit.activate('thawing');
    }

    public deactivate(): Promise<void> {
        return this.gpioUnit.deactivate('thawing');
    }
}
