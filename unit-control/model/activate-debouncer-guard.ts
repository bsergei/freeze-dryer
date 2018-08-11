import { StateSwitchGuard } from './state-switch-guard';
import { UnitController } from './unit-controller';

export class ActivateDebouncerGuard implements StateSwitchGuard {
    constructor(private debounceTimeSeconds: number) {
    }

    public async canActivate(lastActivated: number, lastDeactivated: number) {
        if (lastActivated === undefined) {
            return undefined;
        }

        return UnitController.now() - lastActivated >= this.debounceTimeSeconds;
    }

    public async canDeactivate(lastActivated: number, lastDeactivated: number) {
        return true;
    }
}
