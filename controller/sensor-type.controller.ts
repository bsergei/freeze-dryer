import { controller, httpGet } from 'inversify-express-utils';
import { Request } from 'express';

@controller('/api/sensor/type')
export class SensorTypeController {

  constructor() {
  }

  @httpGet('/')
  public async get(req: Request) {
      return [{
        id: 'Condenser Input'
      },
      {
        id: 'Condenser Output'
      },
      {
        id: 'Freezer Camera'
      },
      {
        id: 'Product'
      },
      {
        id: 'Heater'
      },
      {
        id: 'Compressor'
      }
    ];;
  }
}
