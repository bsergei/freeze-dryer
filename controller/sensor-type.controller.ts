import { controller, httpGet } from 'inversify-express-utils';
import { Request } from 'express';
import { sensorTypes } from '../model/sensor-type.model';

@controller('/api/sensor/type')
export class SensorTypeController {

  @httpGet('/')
  public async get(req: Request) {
      return sensorTypes;
  }
}
