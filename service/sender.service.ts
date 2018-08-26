import { injectable } from 'inversify';
import { StorageService } from './storage.service';
import { InfluxService } from './influx.service';
import { Log } from './logger.service';

@injectable()
export class SenderService {

    constructor(
        private influxService: InfluxService,
        private storageService: StorageService,
        private log: Log) {
    }

    public async init() {
        const r = await this.storageService.isConnected;
        if (r) {
            this.writeSensorStatus();
            this.log.info('Sensors data sender started successfully');
        }
    }

    private async writeSensorStatus() {
        try {
            await this.influxService.writeSensorStatus();
            this.log.info('Sent sensor data');
        } catch (e) {
            this.log.error(`Error in SenderService.writeSensorStatus: ${e}`);
        }
        setTimeout(() => this.writeSensorStatus(), 1000);
    }
}
