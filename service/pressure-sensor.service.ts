import { injectable } from 'inversify';
import { AdcService } from './adc.service';
import { PressureInterpolatorService } from './pressure-interpolator.service';

@injectable()
export class PressureSensorService {

    constructor(
        private adcService: AdcService,
        private pressureService: PressureInterpolatorService) {
    }

    public async readPressure(src: 'A0' | 'A1') {
        const volts = await this.adcService.readAdc(src);
        return this.pressureService.getPressure(src, volts);
    }
}
