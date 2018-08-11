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
                checker => checker.shouldDeactivate(lastActivated, lastDeactivated)));

        // Check for ALL are true.

        if (results.length === 0) {
            return undefined;
        }

        for (const result of results) {
            if (result === false) {
                return false;
            }
        }
        return true;
    }

    public async shouldDeactivate(lastActivated: number, lastDeactivated: number): Promise<boolean> {
        const results = await Promise.all(
            this.checkers.map(
                checker => checker.shouldDeactivate(lastActivated, lastDeactivated)));

        if (results.length === 0) {
            return undefined;
        }

        // Check for ANY is true.

        for (const result of results) {
            if (result === true) {
                return true;
            }
        }
        return false;
    }
}
