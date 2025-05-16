import { AdbController } from '../adb/adb.controller';
import { TaskDto } from './dto/task.dto';
import { WorkRepository } from './work.repository';
export declare class WorkController {
    private readonly adb;
    private readonly repository;
    constructor(adb: AdbController, repository: WorkRepository);
    cache: {};
    getHello(): Promise<string>;
    getWorks(): Promise<string[]>;
    getWork(workId: string): Promise<any>;
    getTasks(workId: string): Promise<number[]>;
    getTask(workId: string, taskId: string): Promise<any>;
    getQueries(workId: string): Promise<string[]>;
    getWorkQueries(workId: string): Promise<string[]>;
    getExternalDbSizes(workId: string): Promise<any[]>;
    getWorkAndroidTime(workId: string): Promise<any[]>;
    getWorkHostTime(workId: string): Promise<any[]>;
    getVdbe(workId: string, queryId: string): Promise<any[]>;
    getAndroidTimes(workId: string, queryId: string): Promise<any[]>;
    doWork(percentageInterval: number, percentageTo: number): Promise<{
        asdf: number;
    }>;
    doTask(workId: string, taskId: string, body: TaskDto, dbPath?: string): Promise<void>;
    exportDB(workId: string, taskId: string, dbPath?: string): Promise<void>;
    doQueryOnAndroid(workId: string, taskId: string, queryId: string, dbPath?: string): Promise<void>;
    redoHostWork(workId: string, body: TaskDto, dbPath?: string): Promise<void>;
    doQueryOnHost(workId: string, taskId: string, queryId: string): Promise<void>;
}
