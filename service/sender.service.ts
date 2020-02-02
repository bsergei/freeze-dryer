import { injectable } from 'inversify';
import { StorageService } from './storage.service';
import { InfluxService } from './influx.service';
import { Log } from './logger.service';
import { SensorsStatusService } from './sensors-status.service';
import { ShutdownService } from './shutdown.service';

@injectable()
export class SenderService {

    private timer: NodeJS.Timer;
    private isStopped = false;

    constructor(
        private influxService: InfluxService,
        private storageService: StorageService,
        private sensorsStatus: SensorsStatusService,
        private shutdownService: ShutdownService,
        private log: Log) {
        this.shutdownService.subscribe(async () => {
            this.isStopped = true;
            this.stopSender();
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

    private stopSender() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }

    private async writeSensorStatus() {
        if (this.isStopped) {
            return;
        }

        this.stopSender();

        try {
            const status = await this.sensorsStatus.getFromCache();
            await this.influxService.writeSensorStatus(status);
        } catch (e) {
            this.log.error(`Error in SenderService.writeSensorStatus: ${e}`, e);
        }

        if (this.isStopped) {
            return;
        }

        this.timer = setTimeout(() => this.writeSensorStatus(), 5000);
    }
}
