import { injectable } from 'inversify';
import { StorageService } from './storage.service';
import { InfluxService } from './influx.service';
import { UnitWorkerService } from './unit-worker.service';

@injectable()
export class SenderService {

    constructor(
        private influxService: InfluxService,
        private storageService: StorageService,
        private unitWorkerService: UnitWorkerService) {
    }

    public async init() {
        const r = await this.storageService.isConnected;
        if (r) {
            this.writeSensorStatus();
            this.doUnitWorker();
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

    private async doUnitWorker() {
        try {
            await this.unitWorkerService.tick();
        } catch (e) {
            console.log(e);
        }
        setTimeout(() => this.writeSensorStatus(), 500);
    }
}
