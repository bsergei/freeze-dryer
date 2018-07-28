import { injectable } from "inversify";
import { StorageService } from './storage.service';
import { InfluxService } from './influx.service';

@injectable()
export class SenderService {
    
    constructor(
        private influxService: InfluxService,
        private storageService: StorageService) {
    }

    public async init() {
        const r = await this.storageService.isConnected;
        if (r) {
            this.writeSensorStatus();
            console.log('Sensors data sender started successfully');
        }
    }

    private async writeSensorStatus() {
        try {
            await this.influxService.writeSensorStatus();
            console.log(`${new Date()}: Sent sensor data`);
        } catch (e) {
            console.log(e);
        }
        setTimeout(() => this.writeSensorStatus(), 5000);
    }
}
