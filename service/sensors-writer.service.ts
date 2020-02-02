import { injectable } from 'inversify';
import { Log } from './logger.service';
import { SensorsStatusService } from './sensors-status.service';
import { StorageService } from './storage.service';
import { ShutdownService } from './shutdown.service';

@injectable()
export class SensorsWriterService {

    private isInited = false;
    private isStopped = false;

    private timerTemperature: NodeJS.Timer;
    private timerGpioService: NodeJS.Timer;
    private timerPressure: NodeJS.Timer;

    constructor(
        private log: Log,
        private storageService: StorageService,
        private sensorsStatusService: SensorsStatusService,
        private shutdownService: ShutdownService) {
        this.shutdownService.subscribe(async () => {
            this.isStopped = true;

            this.stopTemperatureSensors();
            this.stopGpioSensors();
            this.stopPressureSensors();

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

    private stopPressureSensors() {
        if (this.timerPressure) {
            clearTimeout(this.timerPressure);
            this.timerPressure = undefined;
        }
    }

    private stopGpioSensors() {
        if (this.timerGpioService) {
            clearTimeout(this.timerGpioService);
            this.timerGpioService = undefined;
        }
    }

    private stopTemperatureSensors() {
        if (this.timerTemperature) {
            clearTimeout(this.timerTemperature);
            this.timerTemperature = undefined;
        }
    }

    private async updateTemperatureSensors() {
        if (this.isStopped) {
            return;
        }

        this.stopTemperatureSensors();

        try {
            await this.sensorsStatusService.updateTemperatureSensors();
        } catch (err) {
            this.log.error(`Error in updateTemperatureSensors: ${err}`, err);
        }

        if (this.isStopped) {
            return;
        }

        this.timerTemperature = setTimeout(() => this.updateTemperatureSensors(), 500);
    }

    private async updateGpioSensors() {
        if (this.isStopped) {
            return;
        }

        this.stopGpioSensors();

        try {
            await this.sensorsStatusService.updateGpioSensors();
        } catch (err) {
            this.log.error(`Error in updateGpioSensors: ${err}`, err);
        }

        if (this.isStopped) {
            return;
        }

        this.timerGpioService = setTimeout(() => this.updateGpioSensors(), 100);
    }

    private async updatePressureSensors() {
        if (this.isStopped) {
            return;
        }

        this.stopPressureSensors();

        try {
            await this.sensorsStatusService.updatePressureSensors();
        } catch (err) {
            this.log.error(`Error in updatePressureSensors: ${err}`, err);
        }

        if (this.isStopped) {
            return;
        }

        this.timerPressure = setTimeout(() => this.updatePressureSensors(), 300);
    }
}
