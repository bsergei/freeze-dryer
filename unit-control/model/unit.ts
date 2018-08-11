export interface Unit {
    getIsActive(): Promise<boolean>;
    activate(): Promise<void>;
    deactivate(): Promise<void>;
}
