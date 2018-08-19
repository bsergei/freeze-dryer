import { injectable } from 'inversify';
import { GpioUnit } from './gpio-unit';
import { Unit } from '../model/unit';

@injectable()
export class FanUnit implements Unit {
    constructor(private gpioUnit: GpioUnit) {
    }

    public getId(): string {
        return 'fan';
    }

    public getIsActive(): Promise<boolean> {
        return this.gpioUnit.getIsActive('fan');
    }

    public activate(): Promise<void> {
        return this.gpioUnit.activate('fan');
    }

    public deactivate(): Promise<void> {
        return this.gpioUnit.deactivate('fan');
    }
}
