import { controller, httpGet } from 'inversify-express-utils';
import { Request } from 'express';
import { AdcService, AdcServiceMock } from '../service/adc.service';
import { TempSensorService, TempSensorServiceMock } from '../service/temp-sensor.service';
import { Log } from '../service/logger.service';

@controller('/api/mock')
export class MockController {

    constructor(
        private log: Log,
        private adcService: AdcService,
        private temperatureService: TempSensorService) {
    }

    @httpGet('/adc')
    public async setAdc(req: Request) {
        // tslint:disable-next-line:no-string-literal
        this.log.info(`ADC Mock: '${req.query['id']}' = '${req.query['value']}'`);
        // tslint:disable-next-line:no-string-literal
        (this.adcService as AdcServiceMock).writeAdc(req.query['id'].toUpperCase(), Number(req.query['value']));
    }

    @httpGet('/temp-sensor')
    public async setTempSensor(req: Request) {
        // tslint:disable-next-line:no-string-literal
        this.log.info(`SensorTemp Mock: '${req.query['id']}' = '${req.query['value']}'`);
        // tslint:disable-next-line:no-string-literal
        (this.temperatureService as TempSensorServiceMock).setTemperature(req.query['id'], Number(req.query['value']));
    }

    @httpGet('/error-test')
    public async errorTest(req: Request) {
        this.log.error('Error test');
    }
}
