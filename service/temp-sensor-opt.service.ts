import { injectable } from 'inversify';
import { StorageService } from './storage.service';
import { SensorOpt } from '../model/sensor-opt.model';


const storageSensorOptsKey = 'storage:sensor-opts';

@injectable()
export class TempSensorOptService {

    constructor(private storageService: StorageService) {
    }

    public async getSensorOpts() {
        return (await this.storageService.get<SensorOpt[]>(storageSensorOptsKey)) || [];
    }

    public async getSensorOpt(sensorId: string) {
        const result = (await this.storageService.get<SensorOpt[]>(storageSensorOptsKey)) || [];
        const item = result.find(v => v.sensor_id === sensorId);
        if (item) {
            return item;
        }
    }

    public async addOrUpdateSensorOpt(opt: SensorOpt) {
        if (!opt) {
            return;
        }
        const result = (await this.storageService.get<SensorOpt[]>(storageSensorOptsKey)) || [];
        if (opt.sensor_id) {
            const item = result.find(v => v.sensor_id === opt.sensor_id);
            if (item) {
                item.sensor_type = opt.sensor_type;
            } else {
                result.push(opt);
            }
            await this.storageService.set<SensorOpt[]>(storageSensorOptsKey, result);
        }
    }

    public async deleteSensorOpt(sensorId: string) {
        const result = (await this.storageService.get<SensorOpt[]>(storageSensorOptsKey)) || [];
        const item =  result.find(v => v.sensor_id === sensorId);
        if (item) {
            const newResult = result.filter(i => i !== item);
            await this.storageService.set<SensorOpt[]>(storageSensorOptsKey, newResult);
            return item;
        } else {
            return undefined;
        }
    }
}
