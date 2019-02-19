import { controller, httpGet } from 'inversify-express-utils';
import { Request } from 'express';
import { SensorsStatusService } from '../service/sensors-status.service';

@controller('/api/sensors-status')
export class SensorsStatusController {

  constructor(
      private sensorsStatusService: SensorsStatusService) {
  }

  @httpGet('/')
  public async get(req: Request) {
      let result = await this.sensorsStatusService.getFromCache();
      return result;
  }
}
