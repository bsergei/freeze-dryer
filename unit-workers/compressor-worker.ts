import {
    CompressorUnit,
    TemperatureParamFactory,
    ActivateDebouncerGuard,
    MaxValueProtector,
    MinValueProtector,
    UnitController,
    AggregatedSwitchChecker
} from '../unit-control';

import { UnitWorker } from './unit-worker';
import { injectable } from 'inversify';

@injectable()
export class CompressorWorkerFactory {
    constructor(
        private compressorUnit: CompressorUnit,
        private tempParamFactory: TemperatureParamFactory) {
    }

    public create(p: CompressorWorkerParams) {
        return new CompressorWorker(this.compressorUnit,
            this.tempParamFactory,
            p);
    }
}

export interface CompressorWorkerParams {
    minCondenserOutputTemp: number;
    minFreezerCameraTemp: number;
    maxCompressorTemp: number;
    debounceTime: number;
}

export class CompressorWorker extends UnitController implements UnitWorker {

    constructor(
        private compressorUnit: CompressorUnit,
        tempParamFactory: TemperatureParamFactory,
        p: CompressorWorkerParams) {

        super(
            compressorUnit,
            new AggregatedSwitchChecker(
                new MinValueProtector(
                    tempParamFactory.create('condenser_output'),
                    p.minCondenserOutputTemp),
                new MinValueProtector(
                    tempParamFactory.create('freezer_camera'),
                    p.minFreezerCameraTemp),
                new MaxValueProtector(
                    tempParamFactory.create('compressor'),
                    p.maxCompressorTemp)),
            new ActivateDebouncerGuard(p.debounceTime)
        );
    }

    public getId(): string {
        return this.compressorUnit.getId();
    }

    public async onStart() {
        await this.compressorUnit.activate();
        this.lastActivated = UnitController.now();
        this.start();
    }

    public async onTick() {
        return this.tick();
    }

    public async onStop() {
        this.stop();
        await this.compressorUnit.deactivate();
        this.lastDeactivated = UnitController.now();
    }
}
