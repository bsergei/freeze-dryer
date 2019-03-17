import {
    CompressorUnit,
    TemperatureParamFactory,
    ActivateDebouncerGuard,
    MaxValueProtector,
    // MinValueProtector,
    AggregatedSwitchChecker,
    UnitParamReducer
} from '../unit-control';

import { UnitWorker } from './unit-worker';
import { CompressorWorkerParams } from '../model/compressor-worker-params.model';

export class CompressorWorker extends UnitWorker<'compressor'> {
    constructor(
        compressorUnit: CompressorUnit,
        tempParamFactory: TemperatureParamFactory,
        p: CompressorWorkerParams) {

        super(
            'compressor',
            compressorUnit,
            new AggregatedSwitchChecker(
                new UnitParamReducer(
                    tempParamFactory.create('condenser1'),
                    p.minCondenser1Temp,
                    0.5),
                // new MinValueProtector(
                //     tempParamFactory.create('freezer_camera'),
                //     p.minFreezerCameraTemp),
                new MaxValueProtector(
                    tempParamFactory.create('compressor'),
                    p.maxCompressorTemp)
                ),
            new ActivateDebouncerGuard(p.debounceTime),
            p
        );
    }
}
