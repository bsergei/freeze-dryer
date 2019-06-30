import * as vm from 'vm';
import { CompressorUnit, VacuumUnit, HeaterUnit, DrainValveUnit, FanUnit } from '../unit-control';
import { SensorsStatusService } from '../service/sensors-status.service';
import { WorkflowItem } from './model/workflow-item';
import { WfStart } from './model/wf-start';
import { WfAction } from './model/wf-action';
import { WfCondition } from './model/wf-condition';
import { ActionContext } from './context/action-context';
import { WfContextValues } from './context/wf-context-values';
import { Log } from '../service/logger.service';
import { injectable } from 'inversify';

@injectable()
export class WorkflowRunnerServiceFactory {

    constructor(
        private logger: Log,
        private sensorsStatusService: SensorsStatusService,
        private compressorUnit: CompressorUnit,
        private vacuumUnit: VacuumUnit,
        private heaterUnit: HeaterUnit,
        private drainValveUnit: DrainValveUnit,
        private fanUnit: FanUnit) {
    }

    public create(workflow: WorkflowItem[]): WorkflowRunnerService {
        return new WorkflowRunnerService(
            this.logger,
            this.sensorsStatusService,
            this.compressorUnit,
            this.vacuumUnit,
            this.heaterUnit,
            this.drainValveUnit,
            this.fanUnit,
            workflow
        );
    }
}

export class WorkflowRunnerService {
    private sharedData: { context: string };
    private currentItem: WorkflowItem;
    private startTime: Date;

    constructor(
        private logger: Log,
        private sensorsStatusService: SensorsStatusService,
        private compressorUnit: CompressorUnit,
        private vacuumUnit: VacuumUnit,
        private heaterUnit: HeaterUnit,
        private drainValveUnit: DrainValveUnit,
        private fanUnit: FanUnit,
        private workflow: WorkflowItem[]) {
    }

    public start(sharedData: { context: string }) {
        this.startTime = new Date();
        const startItem = this.workflow.find(i => i.type === 'start');
        this.sharedData = sharedData;
        this.currentItem = startItem;
    }

    public getCurrent() {
        return this.currentItem;
    }

    public async runCurrentItem() {
        switch (this.currentItem.type) {
            case 'end':
                return false;

            case 'start':
                const nextIdStart = (this.currentItem as WfStart).next_id;
                this.currentItem = this.getItem(nextIdStart);
                return this.currentItem !== undefined && this.currentItem !== null;

            case 'action':
                const actionItem = (this.currentItem as WfAction);
                await this.runAction(actionItem);
                this.currentItem = this.getItem(actionItem.next_id);
                return this.currentItem !== undefined && this.currentItem !== null;

            case 'condition':
                const conditionItem = (this.currentItem as WfCondition);
                const result = await this.runCondition(conditionItem);
                const nextIdCondition = result === true
                    ? conditionItem.next_id_true
                    : conditionItem.next_id_false;
                this.currentItem = this.getItem(nextIdCondition);
                return this.currentItem !== undefined && this.currentItem !== null;
        }
    }

    private getItem(id: string): WorkflowItem {
        return this.workflow.find(i => i.id === id);
    }

    private async runAction(item: WfAction) {
        const values = new WfContextValues();
        const sensorsStatus = await this.sensorsStatusService.getFromCache();
        const dataContext = new ActionContext(
            this.sharedData,
            this.logger,
            this.startTime,
            sensorsStatus,
            values);
        const actionContext = vm.createContext(dataContext);
        vm.runInContext(item.cmd, actionContext);
        if (values.waitDelay) {
            await new Promise(resolve => setTimeout(() => resolve(), values.waitDelay));
        }
        if (values.compressorUnit !== undefined) {
            if (values.compressorUnit === true) {
                await this.compressorUnit.activate();
            } else {
                await this.compressorUnit.deactivate();
            }
        }
        if (values.vacuumUnit !== undefined) {
            if (values.vacuumUnit === true) {
                await this.vacuumUnit.activate();
            } else {
                await this.vacuumUnit.deactivate();
            }
        }
        if (values.heaterUnit !== undefined) {
            if (values.heaterUnit === true) {
                await this.heaterUnit.activate();
            } else {
                await this.heaterUnit.deactivate();
            }
        }
        if (values.drainValveUnit !== undefined) {
            if (values.drainValveUnit === true) {
                await this.drainValveUnit.activate();
            } else {
                await this.drainValveUnit.deactivate();
            }
        }
        if (values.fanUnit !== undefined) {
            if (values.fanUnit === true) {
                await this.fanUnit.activate();
            } else {
                await this.fanUnit.deactivate();
            }
        }
    }

    private async runCondition(item: WfCondition) {
        const values = new WfContextValues();
        const sensorsStatus = await this.sensorsStatusService.getFromCache();
        const dataContext = new ActionContext(
            this.sharedData,
            this.logger,
            this.startTime,
            sensorsStatus,
            values);
        const actionContext = vm.createContext(dataContext);
        const result = vm.runInContext(item.cmd, actionContext);
        return result as boolean;
    }
}
