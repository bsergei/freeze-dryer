export interface Unit {
    getId(): string;
    getIsActive(): Promise<boolean>;
    activate(): Promise<void>;
    deactivate(): Promise<void>;
}
