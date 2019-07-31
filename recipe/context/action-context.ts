import { SensorsStatus } from '../../model';
import { WfContextValues } from './wf-context-values';
import { WfUnitsContext } from './wf-units-context';
import { WfTimeContext } from './wf-time-context';
import { WfTempContext } from './wf-temp-context';
import { WfVacuumContext } from './wf-vacuum-context';
import { Log } from '../../service/logger.service';
import { SharedData } from '../model/shared-data';

export class ActionContext {
    public time: WfTimeContext;

    public units: WfUnitsContext;

    public temp: WfTempContext;

    public vacuum: WfVacuumContext;

    constructor(
        private data: SharedData,
        private logger: Log,
        startTime: Date,
        sensors: SensorsStatus,
        values: WfContextValues) {
        this.data = data;
        this.time = new WfTimeContext(startTime, values);
        this.units = new WfUnitsContext(values, sensors);
        this.temp = new WfTempContext(sensors);
        this.vacuum = new WfVacuumContext(sensors);
    }

    public log(msg: string) {
        this.logger.info(`WorkflowItem: ${this.data.cursorStr}: ${msg}`);
    }
}
