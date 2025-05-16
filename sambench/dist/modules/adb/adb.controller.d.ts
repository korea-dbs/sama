import { WorkRepository } from '../work/work.repository';
import ADB from 'appium-adb';
export declare class AdbController {
    private readonly repository;
    adb?: ADB;
    constructor(repository: WorkRepository);
    onModuleInit(): Promise<void>;
    adbInitalize(): Promise<void>;
    shell(command: string): Promise<string>;
    executeSqliteQuery(sql: string): Promise<string>;
    executeSqliteQueryBenchmark(sql: string): Promise<{
        android: {
            shell: string;
            result: string;
        };
        host: {
            shell: string;
            result: string;
            vdbe: {};
        };
    }>;
    getDevices(): Promise<{
        selected: boolean;
        udid: string;
        state: string;
        port?: number | undefined;
    }[]>;
    getSelectedDeviceId(): Promise<string>;
    selectDevice(deviceId: string): Promise<void>;
    connectOverWifi(): Promise<void>;
    getStoragePercentage(): Promise<number>;
    generateStorageBatch(batches: number, imgRatio: number, xmpRatio: number): Promise<{
        count: {
            [x: string]: number;
        };
    }>;
    copyBatchOfImages(repeat?: number): Promise<void>;
    fillStorage(targetPercent: number): Promise<void>;
    removeStorage(targetPercent: number): Promise<void>;
    adjustStorage(targetPercent: number): Promise<void>;
    removeImages(second?: number): Promise<void>;
    isMetric: boolean;
    getMetrics(): Promise<string>;
    metricsOn(isMetric: boolean): Promise<void>;
    convertToJsonPrometheusMetrics(data: any): string;
    getExternalDbSize(): Promise<string>;
    getCountOfPending(): Promise<string>;
    getCountOfImages(): Promise<string>;
    getExternalDbFragmentation(dbPath?: string): Promise<number>;
    createTrigger(): Promise<string>;
    dropTrigger(): Promise<string>;
    externalDbFragmentate(batch: number, repeat: number): Promise<void>;
    adjustPendingCount(targetPercent: number): Promise<void>;
    fsImageCount(): Promise<number>;
    dropCache(): Promise<void>;
    broadcastRefresh(): Promise<string>;
    reboot(): Promise<void>;
    pushQuery(): Promise<void>;
    pushFile(localPath: string, remotePath: string): Promise<void>;
    pullFile(androidPath: string, hostPath: string): Promise<any>;
    factoryReset(): Promise<void>;
    getDbList(): Promise<string[]>;
}
