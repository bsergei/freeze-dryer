import { injectable } from 'inversify';
import { Log } from './logger.service';
import { SensorsStatusService } from './sensors-status.service';
import { NotifyService } from './notify.service';
import { SensorsStatus } from '../model/sensors-status.model';
import { StorageService } from './storage.service';

@injectable()
export class SensorsWriterService {

    private isInited = false;

    constructor(
        private log: Log,
        private storageService: StorageService,
        private sensorsStatusService: SensorsStatusService,
        private notifyService: NotifyService) {
    }

    public async init() {
        if (this.isInited) {
            return;
        }

        const r = await this.storageService.isConnected;
        if (r) {
            this.writeSensors(
                'child.sensors.temperatures',
                errors => [this.sensorsStatusService.getTemperatures(errors)],
                1000);

            this.writeSensors(
                'child.sensors.gpios',
                errors => [this.sensorsStatusService.getGpios(errors)],
                100);

            this.writeSensors(
                'child.sensors.pressure',
                errors => [
                    this.sensorsStatusService.getAdcs(errors),
                    this.sensorsStatusService.getPressure(errors)
                ],
                200);

            this.isInited = true;
            this.log.info(`Sensors writer started successfully`);
        }
    }

    private async writeSensors(
        id: string,
        results: (errors: string[]) => Promise<Partial<SensorsStatus>>[],
        timeout: number) {
        try {
            const errors: string[] = [];
            const partialResults = await Promise.all(results(errors));
            await this.sensorsStatusService.updateInCache(partialResults);
            if (errors.length > 0) {
                for (const error of errors) {
                    this.log.error(`Error in ${id}: writeSensors: ${error}`);
                }
                this.notifyService.error(errors);
            }
        } catch (e) {
            this.log.error(`Error in ${id}: writeSensors: ${e}`);
        }
        setTimeout(() => this.writeSensors(id, results, timeout), timeout);
    }
}
