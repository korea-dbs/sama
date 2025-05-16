import { AdbController } from '../adb/adb.controller';
export declare class PublicController {
    private readonly adb;
    constructor(adb: AdbController);
    adjustAll(targetStoragePercent: number, targetFragmantationPercent: number, cpuIntencive: boolean): Promise<void>;
    configWork(configId: string, queryId: string, capacity: number): Promise<void>;
}
