import * as vm from 'vm';
import { CompressorUnit, VacuumUnit, HeaterUnit, DrainValveUnit, FanUnit, Unit } from '../unit-control';
import { SensorsStatusService } from '../service/sensors-status.service';
import { WorkflowItem } from './model/workflow-item';
import { WfStart } from './model/wf-start';
import { WfAction } from './model/wf-action';
import { WfCondition } from './model/wf-condition';
import { ActionContext } from './context/action-context';
import { WfContextValues } from './context/wf-context-values';
import { Log } from '../service/logger.service';
import { injectable } from 'inversify';
import { SharedData } from './model/shared-data';

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

    public create(workflow: WorkflowItem[], sharedData: SharedData): WorkflowRunnerService {
        return new WorkflowRunnerService(
            this.logger,
            this.sensorsStatusService,
            this.compressorUnit,
            this.vacuumUnit,
            this.heaterUnit,
            this.drainValveUnit,
            this.fanUnit,
            workflow,
            sharedData
        );
    }
}

export class WorkflowRunnerService {
    private currentItem: WorkflowItem;
    private startTime: Date;

    private initialized: boolean;
    private conditionResult: boolean;
    private reachedEnd: boolean;
    private isRun: boolean;

    private onErrorItem: WorkflowItem;
    private onAbortItem: WorkflowItem;

    constructor(
        private logger: Log,
        private sensorsStatusService: SensorsStatusService,
        private compressorUnit: CompressorUnit,
        private vacuumUnit: VacuumUnit,
        private heaterUnit: HeaterUnit,
        private drainValveUnit: DrainValveUnit,
        private fanUnit: FanUnit,
        private workflow: WorkflowItem[],
        private sharedData: SharedData) {
        this.initialized = false;
    }

    public getCurrent(): WorkflowItem {
        return this.currentItem;
    }

    public isReachedEnd(): boolean {
        return this.reachedEnd;
    }

    public moveNext(): boolean {
        if (this.currentItem === undefined && !this.initialized) {
            this.initialized = true;
            this.reachedEnd = false;
            this.startTime = new Date();
            this.currentItem = this.workflow.find(i => i.type === 'start');
            if (this.isCurrentItemValid()) {
              const wfStart = this.currentItem as WfStart;
              if (wfStart.on_error_id) {
                this.onErrorItem = this.getItem(wfStart.on_error_id);
              }

              if (wfStart.on_abort_id) {
                this.onAbortItem = this.getItem(wfStart.on_abort_id);
              }
            }
        } else {
            if (!this.isRun) {
                throw new Error('Current item was not run');
            }

            switch (this.currentItem.type) {
                case 'start':
                    const nextIdStart = (this.currentItem as WfStart).next_id;
                    this.currentItem = this.getItem(nextIdStart);
                    break;

                case 'end':
                    this.reachedEnd = true;
                    this.currentItem = undefined;
                    break;

                case 'action':
                    const actionItem = (this.currentItem as WfAction);
                    this.currentItem = this.getItem(actionItem.next_id);
                    break;

                case 'condition':
                    const conditionItem = (this.currentItem as WfCondition);
                    if (this.conditionResult === undefined) {
                        throw new Error('Condition result is not valid.');
                    }

                    const nextIdCondition = this.conditionResult === true
                        ? conditionItem.next_id_true
                        : conditionItem.next_id_false;
                    this.currentItem = this.getItem(nextIdCondition);
                    this.conditionResult = undefined;
                    break;
            }
        }

        this.isRun = false;
        return this.isCurrentItemValid();
    }

    public async runCurrentItem() {
        if (!this.isCurrentItemValid()) {
            return;
        }

        await this.runItem(this.currentItem);

        this.isRun = true;
    }

    public async runOnError() {
      if (!this.isOnErrorItemValid()) {
        return;
      }

      await this.runAction(this.onErrorItem as WfAction);
    }

    public async runOnAbort() {
      if (!this.isOnAbortItemValid()) {
        return;
      }

      await this.runAction(this.onAbortItem as WfAction);
    }

    private async runItem(wfItem: WorkflowItem) {
      switch (wfItem.type) {
        case 'action':
          const actionItem = (wfItem as WfAction);
          await this.runAction(actionItem);
          break;

        case 'condition':
          const conditionItem = (wfItem as WfCondition);
          this.conditionResult = await this.runCondition(conditionItem);
          break;
      }
    }

    private isCurrentItemValid() {
        return this.currentItem !== undefined && this.currentItem !== null;
    }

    private isOnErrorItemValid() {
      return this.onErrorItem !== undefined
        && this.onErrorItem !== null
        && this.onErrorItem.type === 'action';
    }

    private isOnAbortItemValid() {
      return this.onAbortItem !== undefined
        && this.onAbortItem !== null
        && this.onAbortItem.type === 'action';
    }

    private getItem(id: string): WorkflowItem {
        return this.workflow.find(i => i.id === id);
    }

    private async runAction(item: WfAction) {
        if (!item.cmd) {
            return;
        }

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

        if (values.delay) {
            await new Promise((resolve) => setTimeout(() => resolve(), values.delay));
        }

        await this.switchUnitIfNeed(values.compressorUnit, this.compressorUnit);
        await this.switchUnitIfNeed(values.vacuumUnit, this.vacuumUnit);
        await this.switchUnitIfNeed(values.heaterUnit, this.heaterUnit);
        await this.switchUnitIfNeed(values.drainValveUnit, this.drainValveUnit);
        await this.switchUnitIfNeed(values.fanUnit, this.fanUnit);
    }

    private async switchUnitIfNeed(value: boolean, unit: Unit) {
        if (value === true) {
            await unit.activate();
        } else if (value === false) {
            await unit.deactivate();
        }
    }

    private async runCondition(item: WfCondition) {
        if (!item.cmd) {
            throw new Error(`Command is not set for condition '${item.id}'`);
        }

        const sensorsStatus = await this.sensorsStatusService.getFromCache();
        const dataContext = new ActionContext(
            this.sharedData,
            this.logger,
            this.startTime,
            sensorsStatus,
            undefined);
        const actionContext = vm.createContext(dataContext);
        const result = vm.runInContext(item.cmd, actionContext);
        return result as boolean;
    }
}
