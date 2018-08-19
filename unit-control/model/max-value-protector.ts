import { StateSwitchChecker } from './state-switch-checker';
import { ControllableParam } from './controllable-param';

/**
 * E.g., overheat protection.
 */
export class MaxValueProtector implements StateSwitchChecker {

    constructor(
        private unitControlParam: ControllableParam,
        private maxParamValue: number) {

    }

    public async shouldActivate(lastActivated: number, lastDeactivated: number): Promise<boolean> {
        return undefined;
    }

    public async shouldDeactivate(lastActivated: number, lastDeactivated: number): Promise<boolean> {
        const paramValue = await this.unitControlParam.readParamValue();
        if (paramValue === undefined ||
            paramValue === null) {
            return undefined;
        }
        return paramValue >= this.maxParamValue;
    }
}
