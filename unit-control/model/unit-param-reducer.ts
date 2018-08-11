import { StateSwitchChecker } from './state-switch-checker';
import { ControllableParam } from './controllable-param';

/**
 * Like cooler thermostat.
 */
export class UnitParamReducer implements StateSwitchChecker {
    constructor(
        private unitControlParam: ControllableParam,
        private targetParamValue: number,
        private histeresis: number) {
    }

    public async shouldActivate(
        lastActivated: number,
        lastDeactivated: number) {
        const currParamValue = await this.unitControlParam.readParamValue();
        return currParamValue >= (this.targetParamValue + (this.histeresis | 0));
    }

    public async shouldDeactivate(
        lastActivated: number,
        lastDeactivated: number) {
        const currParamValue = await this.unitControlParam.readParamValue();
        return currParamValue <= (this.targetParamValue - (this.histeresis | 0));
    }
}
