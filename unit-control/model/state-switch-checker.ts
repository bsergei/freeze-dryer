export interface StateSwitchChecker {
    shouldActivate(
        lastActivated: number,
        lastDeactivated: number): Promise<boolean>;

    shouldDeactivate(
        lastActivated: number,
        lastDeactivated: number): Promise<boolean>;
}

export class AggregatedSwitchChecker implements StateSwitchChecker {

    private checkers: StateSwitchChecker[];

    constructor(...checkers: StateSwitchChecker[]) {
        this.checkers = checkers;
    }

    public async shouldActivate(lastActivated: number, lastDeactivated: number): Promise<boolean> {
        const results = await Promise.all(
            this.checkers.map(
                checker => checker.shouldActivate(lastActivated, lastDeactivated)));

        // Check for ALL are true.

        let isUndefined = true;

        for (const result of results) {
            if (result === false) {
                return false;
            }

            if (result !== undefined &&
                result !== null) {
                isUndefined = false;
            }
        }

        if (isUndefined === true) {
            return undefined;
        }

        return true;
    }

    public async shouldDeactivate(lastActivated: number, lastDeactivated: number): Promise<boolean> {
        const results = await Promise.all(
            this.checkers.map(
                checker => checker.shouldDeactivate(lastActivated, lastDeactivated)));

        let isUndefined = true;

        // Check for ANY is true.

        for (const result of results) {
            if (result === true) {
                return true;
            }

            if (result !== undefined &&
                result !== null) {
                isUndefined = false;
            }
        }

        if (isUndefined === true) {
            return undefined;
        }

        return false;
    }
}
