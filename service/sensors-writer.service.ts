import { injectable } from 'inversify';
import { Log } from './logger.service';
import { SensorsStatusService } from './sensors-status.service';
import { StorageService } from './storage.service';

@injectable()
export class SensorsWriterService {

    private isInited = false;

    constructor(
        private log: Log,
        private storageService: StorageService,
        private sensorsStatusService: SensorsStatusService) {
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
            this.log.info(`Sensors writer started successfully`);
        }
    }

    private async updateTemperatureSensors() {
        try {
            await this.sensorsStatusService.updateTemperatureSensors();
        } catch (err) {
            this.log.error(`Error in updateTemperatureSensors: ${err}`);
        }
        setTimeout(() => this.updateTemperatureSensors, 500);
    }

    private async updateGpioSensors() {
        try {
            await this.sensorsStatusService.updateGpioSensors();
        } catch (err) {
            this.log.error(`Error in updateGpioSensors: ${err}`);
        }
        setTimeout(() => this.updateGpioSensors, 100);
    }

    private async updatePressureSensors() {
        try {
            await this.sensorsStatusService.updatePressureSensors();
        } catch (err) {
            this.log.error(`Error in updatePressureSensors: ${err}`);
        }
        setTimeout(() => this.updatePressureSensors, 300);
    }
}
