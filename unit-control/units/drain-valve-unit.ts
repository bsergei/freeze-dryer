import { injectable } from 'inversify';
import { GpioUnit } from './gpio-unit';
import { Unit } from '../model/unit';

@injectable()
export class DrainValveUnit implements Unit {
    constructor(private gpioUnit: GpioUnit) {
    }

    public getId(): string {
        return 'drain_valve';
    }

    public getIsActive(): Promise<boolean> {
        return this.gpioUnit.getIsActive('drain_valve');
    }

    public activate(): Promise<void> {
        return this.gpioUnit.activate('drain_valve');
    }

    public deactivate(): Promise<void> {
        return this.gpioUnit.deactivate('drain_valve');
    }
}
