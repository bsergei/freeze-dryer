import { injectable } from 'inversify';
import { GpioUnit } from './gpio-unit';
import { Unit } from '../model/unit';

@injectable()
export class VacuumUnit implements Unit {
    constructor(private gpioUnit: GpioUnit) {
    }

    public getId(): string {
        return 'vacuum';
    }

    public getIsActive(): Promise<boolean> {
        return this.gpioUnit.getIsActive('vacuum');
    }

    public activate(): Promise<void> {
        return this.gpioUnit.activate('vacuum');
    }

    public deactivate(): Promise<void> {
        return this.gpioUnit.deactivate('vacuum');
    }
}
