import { UnitWorkerService } from '../service/unit-worker.service';
import {
    controller, httpGet
} from 'inversify-express-utils';
import { Request, Response } from 'express';
import { CompressorWorkerFactory } from '../unit-workers/compressor-worker';
import { VacuumWorkerFactory } from '../unit-workers/vacuum-worker';
import { HeaterWorkerFactory } from '../unit-workers/heater-worker';
import { DrainValveWorkerFactory } from '../unit-workers/drain-valve-worker';

@controller('/api/unit-worker')
export class UnitWorkerController {
    constructor(
        private unitWorkerService: UnitWorkerService,
        private compressorWorkerFactory: CompressorWorkerFactory,
        private vacuumWorkerFactory: VacuumWorkerFactory,
        private heaterWorkerFactory: HeaterWorkerFactory,
        private drainValveWorkerFactory: DrainValveWorkerFactory) {
    }

    @httpGet('/status')
    public getStatus(req: Request, resp: Response) {
        let result = this.unitWorkerService.getStatus();
        return result;
    }

    @httpGet('/stop-all')
    public async stopAll(req: Request, resp: Response) {
        await this.unitWorkerService.stopAll();
    }

    @httpGet('/start/:id')
    public async startWorker(req: Request, resp: Response) {
        const id = req.params.id as string;

        switch (id) {
            case 'compressor':
                this.addCompressor();
                break;

            case 'vacuum':
                this.addVacuum();
                break;

            case 'heater':
                this.addHeater();
                break;

            case 'drain_valve':
                this.addDrainValve();
                break;
        }
    }

    @httpGet('/stop/:id')
    public async stopWorker(req: Request, resp: Response) {
        const id = req.params.id as string;
        this.unitWorkerService.stop(id);
    }

    private addCompressor() {
        const unitWorker = this.compressorWorkerFactory.create({
            maxCompressorTemp: 60.0,
            minCondenserOutputTemp: -30.0,
            minFreezerCameraTemp: -30.0
        });
        this.unitWorkerService.add(unitWorker);
    }

    private addVacuum() {
        const unitWorker = this.vacuumWorkerFactory.create({
            targetPressure: 500,
            histeresis: 100
        });
        this.unitWorkerService.add(unitWorker);
    }

    private addHeater() {
        const unitWorker = this.heaterWorkerFactory.create({
            tempSensors: [
                {
                    tempSensor: 'heater',
                    targetTemperature: 10.0
                }
            ],
            histeresis: 1.0
        });
        this.unitWorkerService.add(unitWorker);
    }

    private addDrainValve() {
        const unitWorker = this.drainValveWorkerFactory.create();
        this.unitWorkerService.add(unitWorker);
    }
}
