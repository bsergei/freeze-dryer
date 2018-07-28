import { controller, httpGet } from 'inversify-express-utils';
import { TempSensorService } from '../service/temp-sensor.service';
import { Request } from 'express';
import { SensorTemp } from '../model/sensor-temp.model';

@controller('/api/sensor/temp')
export class SensorTempController {

  constructor(private tempSensorService: TempSensorService) {
  }

  @httpGet('/')
  public async get(req: Request) {
    const service = this.tempSensorService;
    const sensors = await service.getSensors();
    if (req.query && req.query['sensor_id'] !== undefined) {
      const result = sensors.map(sensorId => {
        return <SensorTemp>{
          sensor_id: sensorId
        };
      });
      return result;
    } else {
      const results: Promise<SensorTemp>[] = [];
      for (const sensor of sensors) {
        results.push(service.getTemperature(sensor).then(r => {
          return {
            sensor_id: sensor,
            temperature: r
          };
        }));
      }

      const result = await Promise.all(results);
      return result;
    }
  }

  @httpGet('/:id')
  public async getSensorTemp(req: Request) {
    const sensorId = req.params['id'];
    return <SensorTemp>{
      sensor_id: sensorId,
      temperature: await this.tempSensorService.getTemperature(sensorId)
    };
  }
}
