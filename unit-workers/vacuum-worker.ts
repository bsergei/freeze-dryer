import {
    VacuumUnit,
    PressureParam,
    UnitParamReducer
} from '../unit-control';

import { UnitWorker } from './unit-worker';
import { VacuumWorkerParams } from '../model/vacuum-worker-params.model';

export class VacuumWorker extends UnitWorker<'vacuum'> {
    constructor(
        vacuumUnit: VacuumUnit,
        pressureParam: PressureParam,
        p: VacuumWorkerParams) {
        super(
            'vacuum',
            vacuumUnit,
            new UnitParamReducer(
                pressureParam,
                p.targetPressure,
                p.histeresis),
            null,
            p
        );
    }
}
