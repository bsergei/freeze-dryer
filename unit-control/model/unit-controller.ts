import { Unit } from './unit';
import { StateSwitchChecker } from './state-switch-checker';
import { StateSwitchGuard } from './state-switch-guard';

export enum UnitControllerResult {
    Unchanged,
    Activated,
    Deactivated
}

export class NullStateSwitchGuard implements StateSwitchGuard {
    public canActivate(lastActivated: number, lastDeactivated: number): Promise<boolean> {
        return Promise.resolve(true);
    }

    public canDeactivate(lastActivated: number, lastDeactivated: number): Promise<boolean> {
        return Promise.resolve(true);
    }
}

export class UnitController {
    protected lastActivated: number;
    protected lastDeactivated: number;

    protected isRunning = false;

    protected startedTime: number;
    protected lastUpdated: number;

    public static now() {
        return new Date().getTime() / 1000.0;
    }

    constructor(
        private unit: Unit,
        private stateSwitchChecker: StateSwitchChecker,
        private stateSwitchGuard?: StateSwitchGuard) {
        if (this.stateSwitchGuard === undefined
            || this.stateSwitchGuard === null) {
            this.stateSwitchGuard = new NullStateSwitchGuard();
        }
    }

    protected start() {
        this.startedTime = UnitController.now();
        this.isRunning = true;
    }

    protected stop() {
        this.isRunning = false;
    }

    protected async tick() {
        if (!this.isRunning) {
            return UnitControllerResult.Unchanged;
        }

        if (this.lastUpdated === undefined) {
            this.lastUpdated = UnitController.now();
        }

        const now = UnitController.now();

        try {
            const isActive = await this.unit.getIsActive();
            if (isActive) {
                const shouldDeactivate = await this.stateSwitchChecker
                    .shouldDeactivate(this.lastActivated, this.lastDeactivated);
                if (shouldDeactivate === true) {
                    const canDeactivate = await this.stateSwitchGuard
                        .canDeactivate(this.lastActivated, this.lastDeactivated);
                    if (canDeactivate !== false) {
                        await this.unit.deactivate();
                        this.lastDeactivated = now;
                        return UnitControllerResult.Deactivated;
                    }
                }
            } else {
                const shouldActivate = await this.stateSwitchChecker
                    .shouldActivate(this.lastActivated, this.lastDeactivated);
                if (shouldActivate === true) {
                    const canActivate = await this.stateSwitchGuard
                        .canActivate(this.lastActivated, this.lastDeactivated);
                    if (canActivate !== false) {
                        await this.unit.activate();
                        this.lastActivated = now;
                        return UnitControllerResult.Activated;
                    }
                }
            }

            return UnitControllerResult.Unchanged;
        } finally {
            this.lastUpdated = now;
        }
    }
}
