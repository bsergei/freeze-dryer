import { injectable } from 'inversify';
import { GpioUnit } from './gpio-unit';
import { Unit } from '../model/unit';

@injectable()
export class CompressorUnit implements Unit {
    constructor(private gpioUnit: GpioUnit) {
    }

    public getIsActive(): Promise<boolean> {
        return this.gpioUnit.getIsActive('compressor');
    }

    public activate(): Promise<void> {
        return this.gpioUnit.activate('compressor');
    }

    public deactivate(): Promise<void> {
        return this.gpioUnit.deactivate('compressor');
    }
}
