import { SensorsStatus } from '../../model';
import { WfContextValues } from './wf-context-values';
import { WfUnitsContext } from './wf-units-context';
import { WfTimeContext } from './wf-time-context';
import { WfTempContext } from './wf-temp-context';
import { WfVacuumContext } from './wf-vacuum-context';
import { Log } from '../../service/logger.service';
import { SharedData } from '../model/shared-data';
import { StorageService } from '../../service/storage.service';

export class ActionContext {
    private _time: WfTimeContext;
    private _units: WfUnitsContext;
    private _temp: WfTempContext;
    private _vacuum: WfVacuumContext;
    private _cursorStr: string;
    private _custom: string;
    private _log: (msg: string) => void;

    public get cursorStr() {
        return this._cursorStr;
    }

    public get custom() {
        return this._custom;
    }

    public get time() {
        return this._time;
    }

    public get units() {
        return this._units;
    }

    public get temp() {
        return this._temp;
    }

    public get vacuum() {
        return this._vacuum;
    }

    public get log() {
        return this._log;
    }

    constructor(
        data: SharedData,
        logger: Log,
        storage: StorageService,
        startTime: Date,
        sensors: SensorsStatus,
        values: WfContextValues) {
        this._cursorStr = data.cursorStr;
        this._custom = data.custom;
        this._time = new WfTimeContext(startTime, values);
        this._units = new WfUnitsContext(values, sensors);
        this._temp = new WfTempContext(sensors);
        this._vacuum = new WfVacuumContext(sensors);

        this._log = (msg) => {
            const coercedMsg = `WorkflowItem: ${this.cursorStr}: ${msg}`;
            logger.info(coercedMsg);
            storage.publish('recipe-log', coercedMsg);
        };
    }

    public off() {
        this.units.compressor = false;
        this.units.fan = false;
        this.units.heater = false;
        this.units.vacuum = false;
    }
}
