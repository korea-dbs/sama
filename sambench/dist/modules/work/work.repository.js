"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkRepository = void 0;
const common_1 = require("@nestjs/common");
const csv_1 = require("csv");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const const_1 = require("../../utils/const");
let WorkRepository = class WorkRepository {
    async getTasks(workId) {
        const workPath = path.resolve(const_1.HostPath.Workspace, workId);
        const files = await fs.promises.readdir(workPath, { withFileTypes: true });
        const percents = files
            .filter((file) => file.isDirectory())
            .map((file) => Number(file.name));
        return percents;
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
    async readAndroidQueryTime(workId, percent, query) {
        const queryPath = path.resolve(const_1.HostPath.Workspace, workId, percent, query);
        try {
            const data = await this.readJson(path.join(queryPath, 'android-time.json'));
            return data;
        }
        catch (err) {
            return null;
        }
    }
    async readHostQueryTime(workId, percent, query) {
        const queryPath = path.resolve(const_1.HostPath.Workspace, workId, percent, query);
        try {
            const data = await this.readJson(path.join(queryPath, 'host-time.json'));
            return data;
        }
        catch (err) {
            return null;
        }
    }
    async readJson(path) {
        const raw = await fs.readFileSync(path, 'utf-8');
        return JSON.parse(raw);
    }
    async parseCsv(data) {
        return new Promise((resolve, reject) => {
            const records = [];
            (0, csv_1.parse)(data, {
                columns: true,
                skip_empty_lines: true,
            })
                .on('readable', function () {
                let record;
                while ((record = this.read())) {
                    records.push(record);
                }
            })
                .on('end', () => {
                resolve(records);
            })
                .on('error', reject);
        });
    }
    parseAndroidTime(timeStr) {
        const [realStr, , userStr, , systemStr] = timeStr
            .split(/ +/g)
            .filter((t) => t.length > 0);
        const real = this.parseAndroidEachTime(realStr);
        const user = this.parseAndroidEachTime(userStr);
        const system = this.parseAndroidEachTime(systemStr);
        const io = real - user - system;
        return { real, user, system, io };
    }
    parseAndroidEachTime(time) {
        const [minutes, seconds] = time.split('m').map(parseFloat);
        return minutes * 60 + seconds;
    }
    parseHostTime(timeStr) {
        console.log('timeStr', timeStr);
        const [userStr, systemStr, elapsedStr] = timeStr
            .split('\n')[0]
            .split(/ +/g)
            .filter((t) => t.length > 0);
        console.log(userStr, systemStr, elapsedStr);
        const user = parseFloat(userStr.replace('user', ''));
        const system = parseFloat(systemStr.replace('system', ''));
        const real = parseFloat(elapsedStr.split(':')[1].replace('elapsed', ''));
        const io = real - user - system;
        return { real, user, system, io };
    }
    async parseVdbeProfile(vdbePath) {
        const queryWorkspacePath = path.resolve(vdbePath, '..');
        const stream = fs.createReadStream(vdbePath, 'utf-8');
        const rl = readline.createInterface({
            input: stream,
            crlfDelay: Infinity,
        });
        const result = {};
        for await (const line of rl) {
            if (line.charAt(0) === '-')
                continue;
            const splited = line.split(/ +/g).filter((t) => !!t);
            if (!splited[4])
                continue;
            const key = splited[4];
            const value = Number(splited[1]);
            if (!isNaN(value)) {
                if (result[key]) {
                    result[key] += value;
                }
                else {
                    result[key] = value;
                }
            }
        }
        await fs.promises.writeFile(path.join(queryWorkspacePath, 'vdbe-profile.json'), JSON.stringify(result), 'utf-8');
        return result;
    }
};
exports.WorkRepository = WorkRepository;
exports.WorkRepository = WorkRepository = __decorate([
    (0, common_1.Injectable)()
], WorkRepository);
//# sourceMappingURL=work.repository.js.map