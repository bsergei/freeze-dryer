import {
    HeaterUnit,
    TemperatureParamFactory,
    UnitParamIncreaser,
    AggregatedSwitchChecker
} from '../unit-control';

import { UnitWorker } from './unit-worker';
import { HeaterWorkerParams } from '../model/heater-worker-params.model';
import { Log } from '../service/logger.service';

export class HeaterWorker extends UnitWorker<'heater'> {
    constructor(
        heaterUnit: HeaterUnit,
        tempParamFactory: TemperatureParamFactory,
        log: Log,
        p: HeaterWorkerParams) {

        super(
            'heater',
            heaterUnit,
            new AggregatedSwitchChecker(
                ...p.tempSensors.map(ts => new UnitParamIncreaser(
                    tempParamFactory.create(ts.tempSensor),
                    ts.targetTemperature,
                    p.histeresis,
                    log))
            ),
            null,
            p);
    }
}
