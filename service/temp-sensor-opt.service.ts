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

        let idx: number = undefined;
        do {
            idx = result.findIndex(v => {
                return v.sensor_id === opt.sensor_id ||
                    v.sensor_type === opt.sensor_type;
            });
            if (idx >= 0) {
                result.splice(idx, 1);
            }
        }
        while (idx >= 0);

        if (opt.sensor_id && opt.sensor_type) {
            result.push(opt);
        }
        await this.storageService.set<SensorOpt[]>(storageSensorOptsKey, result);
    }
}
