export interface StateSwitchGuard {
    canActivate(
        lastActivated: number,
        lastDeactivated: number): Promise<boolean>;

    canDeactivate(
        lastActivated: number,
        lastDeactivated: number): Promise<boolean>;
}
