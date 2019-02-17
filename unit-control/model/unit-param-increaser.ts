import { StateSwitchChecker } from './state-switch-checker';
import { ControllableParam } from './controllable-param';
import { Log } from '../../service/logger.service';

/**
 * Like heater thermostat.
 */
export class UnitParamIncreaser implements StateSwitchChecker {
    constructor(
        private unitControlParam: ControllableParam,
        private targetParamValue: number,
        private histeresis: number,
        private log: Log) {
    }

    public async shouldActivate(
        lastActivated: number,
        lastDeactivated: number) {
        const paramValue = await this.unitControlParam.readParamValue();
        if (paramValue === undefined ||
            paramValue === null) {
            return false;
        }
        const target = (this.targetParamValue - (this.histeresis | 0));
        const isActivate = paramValue < target;
        if (isActivate) {
            this.log.info(`UnitParamIncreaser: activated: paramValue=${paramValue}, target=${target}`);
        }
        return isActivate;
    }

    public async shouldDeactivate(
        lastActivated: number,
        lastDeactivated: number) {
        const paramValue = await this.unitControlParam.readParamValue();
        if (paramValue === undefined ||
            paramValue === null) {
            this.log.info('UnitParamIncreaser: deactivated due to FAILED sensor');
            return true;
        }
        const target = (this.targetParamValue + (this.histeresis | 0));
        const isDeactivate = paramValue > target;
        if (isDeactivate === true) {
            this.log.info(`UnitParamIncreaser: deactivated: paramValue=${paramValue}, target=${target}`);
        }
        return isDeactivate;
    }
}
