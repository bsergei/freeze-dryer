import { StateSwitchGuard } from './state-switch-guard';
import { UnitController } from './unit-controller';

export class ActivateDebouncerGuard implements StateSwitchGuard {
    constructor(private debounceTimeSeconds: number) {
    }

    public async canActivate(lastActivated: number, lastDeactivated: number) {
        if (lastDeactivated === undefined) {
            return undefined;
        }

        return UnitController.now() - lastDeactivated >= this.debounceTimeSeconds;
    }

    public async canDeactivate(lastActivated: number, lastDeactivated: number) {
        return undefined;
    }
}
