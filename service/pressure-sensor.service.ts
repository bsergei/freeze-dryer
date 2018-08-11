import { injectable } from 'inversify';
import { AdcService } from './adc.service';
import { PressureInterpolatorService } from './pressure-interpolator.service';

@injectable()
export class PressureSensorService {

    constructor(
        private adcService: AdcService,
        private pressureService: PressureInterpolatorService) {
    }

    public async readPressure() {
        const volts = await this.adcService.readAdc(0);
        return this.pressureService.getPressure(volts);
    }
}
