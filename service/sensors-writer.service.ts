import { injectable } from 'inversify';
import { Log } from './logger.service';
import { SensorsStatusService } from './sensors-status.service';
import { StorageService } from './storage.service';
import { ShutdownService } from './shutdown.service';

@injectable()
export class SensorsWriterService {

    private isInited = false;

    private timerTemperature: NodeJS.Timer;
    private timerGpioService: NodeJS.Timer;
    private timerPressure: NodeJS.Timer;

    constructor(
        private log: Log,
        private storageService: StorageService,
        private sensorsStatusService: SensorsStatusService,
        private shutdownService: ShutdownService) {
        this.shutdownService.onSigint(() => {
            if (this.timerTemperature) {
                clearTimeout(this.timerTemperature);
            }

            if (this.timerGpioService) {
                clearTimeout(this.timerGpioService);
            }

            if (this.timerPressure) {
                clearTimeout(this.timerPressure);
            }

            this.log.info(`SensorsWriterService stopped`);
        });
    }

    public async init() {
        if (this.isInited) {
            return;
        }

        const r = await this.storageService.isConnected;
        if (r) {
            this.updateTemperatureSensors();
            this.updateGpioSensors();
            this.updatePressureSensors();

            this.isInited = true;
            this.log.info(`SensorsWriterService started successfully`);
        }
    }

    private async updateTemperatureSensors() {
        try {
            await this.sensorsStatusService.updateTemperatureSensors();
        } catch (err) {
            this.log.error(`Error in updateTemperatureSensors: ${err}`, err);
        }
        this.timerTemperature = setTimeout(() => this.updateTemperatureSensors(), 500);
    }

    private async updateGpioSensors() {
        try {
            await this.sensorsStatusService.updateGpioSensors();
        } catch (err) {
            this.log.error(`Error in updateGpioSensors: ${err}`, err);
        }
        this.timerGpioService = setTimeout(() => this.updateGpioSensors(), 100);
    }

    private async updatePressureSensors() {
        try {
            await this.sensorsStatusService.updatePressureSensors();
        } catch (err) {
            this.log.error(`Error in updatePressureSensors: ${err}`, err);
        }
        this.timerPressure = setTimeout(() => this.updatePressureSensors(), 300);
    }
}
