import { injectable, inject } from "inversify";
import { StorageService } from "./storage.service";
import TYPES from "../constant/types";
import { SensorOpt } from "../model/sensor-opt.model";


const StorageSensorOptsKey = 'storage:sensor-opts';

@injectable()
export class TempSensorOptService {

    constructor(@inject(TYPES.StorageService) private storageService: StorageService) {
    }

    public async getSensorOpts() {
        return (await this.storageService.get<SensorOpt[]>(StorageSensorOptsKey)) || [];
    }
    
    public async getSensorOpt(sensorId: string) {
        const result = (await this.storageService.get<SensorOpt[]>(StorageSensorOptsKey)) || [];
        const item = result.find(v => v.sensor_id === sensorId);
        if (item) {
            return item;
        }
    }

    public async addOrUpdateSensorOpt(opt: SensorOpt) {
        if (!opt) {
            return;
        }
        const result = (await this.storageService.get<SensorOpt[]>(StorageSensorOptsKey)) || [];
        if (opt.sensor_id) {
            const item = result.find(v => v.sensor_id === opt.sensor_id);
            if (item) {
                item.sensor_type = opt.sensor_type;
            } else {
                result.push(opt);
            }
            await this.storageService.set<SensorOpt[]>(StorageSensorOptsKey, result);
        }
    }

    public async deleteSensorOpt(sensorId: string) {
        const result = (await this.storageService.get<SensorOpt[]>(StorageSensorOptsKey)) || [];
        const item =  result.find(v => v.sensor_id === sensorId);
        if (item) {
            const newResult = result.filter(i => i !== item);
            await this.storageService.set<SensorOpt[]>(StorageSensorOptsKey, newResult);
            return item;
        } else {
            return undefined;
        }
    }
}