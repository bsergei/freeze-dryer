import { StateSwitchChecker } from './state-switch-checker';
import { UnitController } from './unit-controller';

/**
 * Deactivate by timer.
 */
export class TimerDeactivator implements StateSwitchChecker {

    private created: number;

    constructor(private timerSeconds) {
        this.created = UnitController.now();
    }

    public async shouldActivate(lastActivated: number, lastDeactivated: number) {
        return false;
    }

    public async shouldDeactivate(lastActivated: number, lastDeactivated: number) {
        return (UnitController.now() - this.created) > this.timerSeconds;
    }
}
