import { AdbController } from './adb.controller';
export declare class SetupController {
    private readonly adbService;
    constructor(adbService: AdbController);
    generateStorageBatch(batches?: number, imgRatio?: number, xmpRatio?: number): Promise<{
        count: {
            [key: string]: number;
        };
    }>;
    pushScripts(): Promise<{
        message: string;
        outputs: any[];
    }>;
    pushQuery(): Promise<void>;
}
