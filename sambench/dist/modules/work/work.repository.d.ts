export declare class WorkRepository {
    getTasks(workId: string): Promise<number[]>;
    getWorkQueries(workId: string): Promise<string[]>;
    readAndroidQueryTime(workId: string, percent: string, query: string): Promise<any>;
    readHostQueryTime(workId: string, percent: string, query: string): Promise<any>;
    readJson(path: string): Promise<any>;
    parseCsv(data: string): Promise<unknown>;
    parseAndroidTime(timeStr: string): {
        real: number;
        user: number;
        system: number;
        io: number;
    };
    parseAndroidEachTime(time: string): number;
    parseHostTime(timeStr: string): {
        real: number;
        user: number;
        system: number;
        io: number;
    };
    parseVdbeProfile(vdbePath: string): Promise<{}>;
}
