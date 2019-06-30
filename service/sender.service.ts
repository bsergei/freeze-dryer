import { injectable } from 'inversify';
import { StorageService } from './storage.service';
import { InfluxService } from './influx.service';
import { Log } from './logger.service';
import { SensorsStatusService } from './sensors-status.service';
import { ShutdownService } from './shutdown.service';

@injectable()
export class SenderService {

    private timer: NodeJS.Timer;

    constructor(
        private influxService: InfluxService,
        private storageService: StorageService,
        private sensorsStatus: SensorsStatusService,
        private shutdownService: ShutdownService,
        private log: Log) {
        this.shutdownService.onSigint(() => {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.log.info('SenderService stopped');
        });
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
            const status = await this.sensorsStatus.getFromCache();
            await this.influxService.writeSensorStatus(status);
        } catch (e) {
            this.log.error(`Error in SenderService.writeSensorStatus: ${e}`, e);
        }
        this.timer = setTimeout(() => this.writeSensorStatus(), 5000);
    }
}
