import { controller, httpGet } from 'inversify-express-utils';
import { Request } from 'express';
import { SensorsStatusService } from '../service/sensors-status.service';
import { inject } from 'inversify';
import TYPES from '../constant/types';

@controller('/api/sensors-status')
export class SensorsStatusController {

  constructor(
      @inject(TYPES.SensorsStatusService) private sensorsStatusService: SensorsStatusService) {
  }

  @httpGet('/')
  public get(req: Request) {
      return this.sensorsStatusService.getSensorsStatus();
  }
}
