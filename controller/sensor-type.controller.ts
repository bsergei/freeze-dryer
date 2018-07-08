import { controller, httpGet } from 'inversify-express-utils';
import { Request } from 'express';
import { SensorTypes } from '../model/sensor-type.model';

@controller('/api/sensor/type')
export class SensorTypeController {

  constructor() {
  }

  @httpGet('/')
  public async get(req: Request) {
      return SensorTypes;
  }
}
