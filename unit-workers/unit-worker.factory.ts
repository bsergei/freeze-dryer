import { injectable } from "inversify";
import { HeaterUnit, TemperatureParamFactory, CompressorUnit, VacuumUnit, PressureParam } from "../unit-control";
import { Log } from "../service/logger.service";
import { HeaterWorker } from "./heater-worker";
import { CompressorWorker } from "./compressor-worker";
import { VacuumWorker } from "./vacuum-worker";
import { BaseUnitWorkerParams } from "../model/unit-worker-params.model";
import { UnitWorkerId, CompressorWorkerParams, VacuumWorkerParams, HeaterWorkerParams } from "../model";

@injectable()
export class UnitWorkerFactory {
    constructor(
        private heaterUnit: HeaterUnit,
        private compressorUnit: CompressorUnit,
        private vacuumUnit: VacuumUnit,
        private tempParamFactory: TemperatureParamFactory,
        private pressureParam: PressureParam,
        private log: Log) {
    }

    public create(id: UnitWorkerId, p: BaseUnitWorkerParams) {
        switch (id) {
            case 'compressor':
                return new CompressorWorker(
                    this.compressorUnit,
                    this.tempParamFactory,
                    p as CompressorWorkerParams);

            case 'vacuum':
                return new VacuumWorker(
                    this.vacuumUnit,
                    this.pressureParam,
                    p as VacuumWorkerParams);

            case 'heater':
                return new HeaterWorker(
                    this.heaterUnit,
                    this.tempParamFactory,
                    this.log,
                    p as HeaterWorkerParams);
        }
    }
}
