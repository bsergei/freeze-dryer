export interface UnitWorkerStatus {
    runningIds: string[];
    params: { id: string, p: any }[];
}
