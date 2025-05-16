"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkController = void 0;
const openapi = require("@nestjs/swagger");
const adb_controller_1 = require("../in/adb.controller");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const child_process = require("child_process");
const date_fns_1 = require("date-fns");
const fs = require("fs");
const path = require("path");
const const_1 = require("../../utils/const");
const work_repository_1 = require("../out/work.repository");
const task_dto_1 = require("./dto/task.dto");
const setup_controller_1 = require("./setup.controller");
let WorkController = class WorkController {
    constructor(adb, setup, repository) {
        this.adb = adb;
        this.setup = setup;
        this.repository = repository;
        this.cache = {};
    }
    async getHello() {
        return 'IDS Android Sqllite Performance Council API Server';
    }
    async getWorks() {
        console.log('workspacePath', const_1.workspacePath);
        const files = await fs.promises.readdir(const_1.workspacePath, {
            withFileTypes: true,
        });
        const folders = files
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);
        return folders;
    }
    async getWork(workId) {
        if (this.cache[workId]) {
            return this.cache[workId];
        }
        const workPath = path.resolve(const_1.workspacePath, workId);
        const files = await fs.promises.readdir(workPath);
        const fileObj = {};
        for (const file of files) {
            const stats = await fs.promises.stat(path.join(workPath, file));
            if (stats.isDirectory()) {
                fileObj[file] = await this.getTask(workId, file);
            }
        }
        this.cache[workId] = fileObj;
        return fileObj;
    }
    async getTasks(workId) {
        const workPath = path.resolve(const_1.HostPath.Workspace, workId);
        const files = await fs.promises.readdir(workPath, { withFileTypes: true });
        const percents = files
            .filter((file) => file.isDirectory())
            .map((file) => Number(file.name));
        return percents;
    }
    async getTask(workId, taskId) {
        const taskPath = path.resolve(const_1.workspacePath, workId, taskId);
        const files = await fs.promises.readdir(taskPath);
        const fileObj = {};
        for (const file of files) {
            const stats = await fs.promises.stat(path.join(taskPath, file));
            if (stats.isDirectory()) {
            }
        }
        return fileObj;
    }
    async getQueries(workId) {
        const workPath = path.resolve(const_1.HostPath.Workspace, workId);
        const tasks = await fs.promises.readdir(workPath);
        const queries = new Set();
        for (const percent of tasks) {
            try {
                const queryPath = path.join(workPath, percent);
                const files = await fs.promises.readdir(queryPath);
                for (const file of files) {
                    if (fs.lstatSync(path.join(queryPath, file)).isDirectory()) {
                        queries.add(file);
                    }
                }
            }
            catch (err) { }
        }
        return Array.from(queries.values());
    }
    async getWorkQueries(workId) {
        const workPath = path.resolve(const_1.HostPath.Workspace, workId);
        const tasks = await fs.promises.readdir(workPath);
        const queries = new Set();
        for (const percent of tasks) {
            try {
                const queryPath = path.join(workPath, percent);
                const files = await fs.promises.readdir(queryPath);
                for (const file of files) {
                    if (fs.lstatSync(path.join(queryPath, file)).isDirectory()) {
                        queries.add(file);
                    }
                }
            }
            catch (err) { }
        }
        return Array.from(queries.values());
    }
    async getExternalDbSizes(workId) {
        const tasks = await this.getTasks(workId);
        const queries = await this.getWorkQueries(workId);
        console.log({ tasks, queries });
        const ret = [];
        for (const task of tasks) {
            const queryRes = {
                task,
                size: (await fs.promises.stat(path.resolve(const_1.workspacePath, workId, `${task}`, 'external.db'))).size,
            };
            ret.push(queryRes);
        }
        return ret.sort((a, b) => Number(a.task) - Number(b.task));
    }
    async getWorkAndroidTime(workId) {
        const tasks = await this.getTasks(workId);
        const queries = await this.getWorkQueries(workId);
        console.log({ tasks, queries });
        const ret = [];
        for (const task of tasks) {
            const queryRes = {
                task,
            };
            for (const query of queries) {
                queryRes[query] = (await this.repository.readAndroidQueryTime(workId, `${task}`, query))?.real;
            }
            ret.push(queryRes);
        }
        return ret.sort((a, b) => Number(a.task) - Number(b.task));
    }
    async getWorkHostTime(workId) {
        const tasks = await this.repository.getTasks(workId);
        const queries = await this.repository.getWorkQueries(workId);
        console.log({ tasks, queries });
        const ret = [];
        for (const task of tasks) {
            const queryRes = {
                task,
            };
            for (const query of queries) {
                queryRes[query] = (await this.repository.readHostQueryTime(workId, `${task}`, query))?.real;
            }
            ret.push(queryRes);
        }
        return ret.sort((a, b) => Number(a.task) - Number(b.task));
    }
    async getVdbe(workId, queryId) {
        try {
            const tasks = await this.repository.getTasks(workId);
            const ret = [];
            for (const task of tasks) {
                const vdbePath = path.resolve(const_1.workspacePath, workId, `${task}`, queryId, 'vdbe-profile.json');
                const raw = await fs.promises.readFile(vdbePath, 'utf-8');
                const data = JSON.parse(raw);
                ret.push({
                    task,
                    ...data,
                });
            }
            return ret.sort((a, b) => Number(a.task) - Number(b.task));
        }
        catch (err) {
            console.error(`Error reading the VDBe profile file: ${err}`);
            throw new Error(`Could not read the VDBe profile file: ${err}`);
        }
    }
    async getAndroidTimes(workId, queryId) {
        const tasks = await this.repository.getTasks(workId);
        const ret = [];
        for (const task of tasks) {
            const androidTimePath = path.resolve(const_1.workspacePath, workId, `${task}`, queryId, 'android-time.json');
            const raw = await fs.promises.readFile(androidTimePath, 'utf-8');
            const data = JSON.parse(raw);
            delete data.real;
            ret.push({
                task,
                io: data.io,
                cpu: data.user + data.system,
            });
        }
        return ret.sort((a, b) => Number(a.task) - Number(b.task));
    }
    async doWork(percentageInterval, percentageTo) {
        const workId = (0, date_fns_1.format)(new Date(), 'yyyyMMdd-HHmmss');
        const queriesPath = path.join(const_1.sourcesPath, 'queries');
        const queries = await fs.promises.readdir(queriesPath);
        await this.setup.pushQuery();
        const targetIndex = Math.floor(percentageTo / percentageInterval);
        let currentPercent = await this.adb.getStoragePercentage();
        for (let i = Math.floor(currentPercent / percentageInterval); i < targetIndex; i = Math.floor(currentPercent / percentageInterval) + 1) {
            const targetPercent = i * percentageInterval;
            console.log(`Filling storage to ${targetPercent}% (#${targetIndex})`);
            await this.adb.fillStorage(targetPercent);
            currentPercent = await this.adb.getStoragePercentage();
            const taskId = `${i * percentageInterval}`;
            await this.doTask(workId, taskId, { queries });
        }
        return {
            asdf: 11,
        };
    }
    async doTask(workId, taskId, body, dbPath) {
        const queries = body.queries;
        console.log(`Task for ${taskId}%`);
        this.setup.pushQuery();
        await this.exportDB(workId, taskId, dbPath);
        for (const queryId of queries) {
            await this.doQueryOnAndroid(workId, taskId, queryId, dbPath);
            await this.doQueryOnHost(workId, taskId, queryId);
        }
    }
    async exportDB(workId, taskId, dbPath = const_1.AndroidPath.ExternalDB) {
        await this.adb.pullFile(dbPath, path.resolve(const_1.workspacePath, workId, taskId, 'external.db'));
    }
    async doQueryOnAndroid(workId, taskId, queryId, dbPath = const_1.AndroidPath.ExternalDB) {
        console.log(`[Android] Query for ${queryId}`);
        await this.adb.dropCache();
        const res = await this.adb.shell(`((echo -e ".eqp on\\n.scanstats on\\n" ; cat ${const_1.AndroidPath.Query}/${queryId}) | time sqlite3 ${dbPath}) 2>&1 | tail -n 1`);
        const times = this.repository.parseAndroidTime(res);
        const androidTimePath = path.resolve(const_1.workspacePath, workId, taskId, queryId, 'android-time.json');
        await fs.promises.mkdir(path.dirname(androidTimePath), {
            recursive: true,
        });
        await fs.promises.writeFile(androidTimePath, JSON.stringify(times), 'utf-8');
    }
    async redoHostWork(workId, body, dbPath = const_1.AndroidPath.ExternalDB) {
        const tasks = await fs.promises.readdir(path.resolve(const_1.workspacePath, workId), {
            withFileTypes: true,
        });
        for (const task of tasks) {
            const queries = await fs.promises.readdir(path.resolve(const_1.workspacePath, workId, task.name), {
                withFileTypes: true,
            });
            for (const query of queries) {
                const queryPath = path.resolve(const_1.workspacePath, workId, task.name, query.name);
                console.log({ query });
                try {
                    const filesToDelete = [
                        'host-time.json',
                        'vdbe-profile.json',
                        'vdbe-profile.out',
                    ];
                    for (const file of filesToDelete) {
                        const filePath = path.join(queryPath, file);
                        if (await fs.promises.stat(filePath).catch(() => false)) {
                            await fs.promises.unlink(filePath);
                            console.log(`Deleted ${filePath}`);
                        }
                    }
                }
                catch (err) {
                    console.error(err);
                }
            }
        }
        for (const task of tasks) {
            for (const query of body.queries) {
                await this.doQueryOnHost(workId, task.name, query);
            }
        }
    }
    async doQueryOnHost(workId, taskId, queryId) {
        console.log(`[Host] Query for ${queryId}`);
        const taskPath = path.resolve(const_1.workspacePath, workId, taskId);
        const queryWorkspacePath = path.resolve(taskPath, queryId);
        const sqlitePath = path.resolve(taskPath, 'external.db');
        const queryPath = path.resolve(const_1.sourcesPath, 'queries', queryId);
        const hostTimePath = path.resolve(queryWorkspacePath, 'host-time.json');
        await fs.promises.mkdir(queryWorkspacePath, {
            recursive: true,
        });
        const ret = child_process.execSync(`cd ${queryWorkspacePath} ; echo 3 > /proc/sys/vm/drop_caches ; ((echo -e ".eqp on\\n.scanstats on\\n" ; cat ${queryPath}) | time sqlite3 ${sqlitePath}) 2>&1 | tail -n 2`, { shell: '/bin/bash' });
        const times = this.repository.parseHostTime(ret.toString());
        await fs.promises.mkdir(path.dirname(hostTimePath), {
            recursive: true,
        });
        await fs.promises.writeFile(hostTimePath, JSON.stringify(times), 'utf-8');
        const vdbeProfileDestPath = path.join(queryWorkspacePath, 'vdbe_profile.out');
        await this.repository.parseVdbeProfile(vdbeProfileDestPath);
    }
};
exports.WorkController = WorkController;
__decorate([
    openapi.ApiOperation({ summary: "Returns a greeting message." }),
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getHello", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves a list of all works." }),
    (0, common_1.Get)('works'),
    openapi.ApiResponse({ status: 200, type: [String] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getWorks", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves details of a specific work by its ID." }),
    (0, common_1.Get)('works/:workId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('workId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getWork", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves tasks associated with a specific work by its ID." }),
    (0, common_1.Get)('works/:workId/tasks'),
    openapi.ApiResponse({ status: 200, type: [Number] }),
    __param(0, (0, common_1.Param)('workId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getTasks", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves queries associated with a specific work by its ID." }),
    (0, common_1.Get)('works/:workId/queries'),
    openapi.ApiResponse({ status: 200, type: [String] }),
    __param(0, (0, common_1.Param)('workId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getQueries", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves external database sizes for a specific work by its ID." }),
    (0, common_1.Get)('works/:workId/external-db-sizes'),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('workId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getExternalDbSizes", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves Android execution time for a specific work by its ID." }),
    (0, common_1.Get)('works/:workId/android/time'),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('workId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getWorkAndroidTime", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves host execution time for a specific work by its ID." }),
    (0, common_1.Get)('works/:workId/host/time'),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('workId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getWorkHostTime", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves VDBE information for a specific work and query by their IDs." }),
    (0, common_1.Get)('works/:workId/queries/:queryId/vdbe'),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('workId')),
    __param(1, (0, common_1.Param)('queryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getVdbe", null);
__decorate([
    (0, common_1.Get)('works/:workId/queries/:queryId/android-times'),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('workId')),
    __param(1, (0, common_1.Param)('queryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "getAndroidTimes", null);
__decorate([
    openapi.ApiOperation({ summary: "Initiates a work process based on specified percentage intervals." }),
    (0, common_1.Post)('works'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Query)('percentageInterval')),
    __param(1, (0, common_1.Query)('percentageTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "doWork", null);
__decorate([
    openapi.ApiOperation({ summary: "Executes a task based on work ID and task ID." }),
    (0, swagger_1.ApiQuery)({ name: 'dbPath', required: false }),
    (0, common_1.Post)('works/:workId/tasks/:taskId'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('workId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('dbPath')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, task_dto_1.TaskDto, String]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "doTask", null);
__decorate([
    openapi.ApiOperation({ summary: "Exports the database for a given work and task." }),
    (0, common_1.Post)('works/:workId/tasks/:taskId/export-db'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('workId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Query)('dbPath')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "exportDB", null);
__decorate([
    openapi.ApiOperation({ summary: "Re-executes host work for a given work ID." }),
    (0, common_1.Post)('works/:workId/redo-host-work'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('workId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('dbPath')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, task_dto_1.TaskDto, String]),
    __metadata("design:returntype", Promise)
], WorkController.prototype, "redoHostWork", null);
exports.WorkController = WorkController = __decorate([
    (0, swagger_1.ApiTags)('MISC-Evaluate'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [adb_controller_1.AdbController,
        setup_controller_1.SetupController,
        work_repository_1.WorkRepository])
], WorkController);
//# sourceMappingURL=work.controller.js.map