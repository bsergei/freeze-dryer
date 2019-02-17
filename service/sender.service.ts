import { injectable } from 'inversify';
import { StorageService } from './storage.service';
import { InfluxService } from './influx.service';
import { Log } from './logger.service';
import { SensorsStatusService } from './sensors-status.service';

@injectable()
export class SenderService {

    constructor(
        private influxService: InfluxService,
        private storageService: StorageService,
        private sensorsStatus: SensorsStatusService,
        private log: Log) {
    }

    public async init() {
        const r = await this.storageService.isConnected;
        if (r) {
            this.writeSensorStatus(new Date());
            this.log.info('Sensors data sender started successfully');
        }
    }

    private async writeSensorStatus(lastWritten: Date) {
        try {
            const status = await this.sensorsStatus.getFromCache();
            await this.influxService.writeSensorStatus(status, lastWritten);
            this.log.info('Sent sensor data');
        } catch (e) {
            this.log.error(`Error in SenderService.writeSensorStatus: ${e}`);
        }
        var newLastWritten = new Date();
        setTimeout(() => this.writeSensorStatus(newLastWritten), 5000);
    }
}
