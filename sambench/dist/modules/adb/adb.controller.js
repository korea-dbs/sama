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
exports.AdbController = void 0;
const openapi = require("@nestjs/swagger");
const work_repository_1 = require("../work/work.repository");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const appium_adb_1 = require("appium-adb");
const child_process = require("child_process");
const date_fns_1 = require("date-fns");
const fs = require("fs");
const path = require("path");
const const_1 = require("../../utils/const");
const utils_1 = require("../../utils/utils");
let AdbController = class AdbController {
    constructor(repository) {
        this.repository = repository;
        this.isMetric = true;
    }
    async onModuleInit() {
        this.adb = await appium_adb_1.default.createADB({
            adbExecTimeout: 5 * 60 * 1000,
        });
        await this.adbInitalize();
    }
    async adbInitalize() {
        await this.adb.root();
        const devices = await this.adb.getConnectedDevices();
        if (devices[0].udid)
            this.adb.setDeviceId(devices[0].udid);
    }
    async shell(command) {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        return this.adb.shell(command);
    }
    async executeSqliteQuery(sql) {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        const fixedQuery = sql.replace(/'/g, '"');
        return this.shell(`echo '${fixedQuery}' | sqlite3 ${const_1.AndroidPath.ExternalDB}`);
    }
    async executeSqliteQueryBenchmark(sql) {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        const dbPathOnDevice = `${const_1.AndroidPath.ExternalDB}`;
        const dbPathOnHost = path.resolve(const_1.HostPath.Workspace, 'temp.db');
        await this.adb.pull(dbPathOnDevice, dbPathOnHost);
        const vdbeProfilePath = path.resolve(const_1.HostPath.Workspace, 'vdbe_profile.out');
        try {
            const fixedQuery = sql.replace(/'/g, '"');
            const androidShellCommand = `(echo '${fixedQuery}' | time sqlite3 ${const_1.AndroidPath.ExternalDB}) 2>&1`;
            const androidResult = await this.shell(androidShellCommand);
            const hostShellCommand = `(cd ${const_1.workspacePath} ; echo 3 > /proc/sys/vm/drop_caches ; ((echo -e '.eqp on\\n.scanstats on\\n' ; echo '${fixedQuery}') | time sqlite3 ${dbPathOnHost})) 2>&1`;
            const hostResult = child_process
                .execSync(hostShellCommand, { shell: '/bin/bash' })
                .toString();
            const vdbe = await this.repository.parseVdbeProfile(vdbeProfilePath);
            return {
                android: {
                    shell: androidShellCommand,
                    result: androidResult,
                },
                host: {
                    shell: hostShellCommand,
                    result: hostResult,
                    vdbe,
                },
            };
        }
        finally {
            fs.unlinkSync(dbPathOnHost);
            fs.unlinkSync(vdbeProfilePath);
        }
    }
    async getDevices() {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        const devices = await this.adb.getDevicesWithRetry();
        return devices.map((device) => ({
            ...device,
            selected: device.udid === this.adb?.curDeviceId,
        }));
    }
    async getSelectedDeviceId() {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        return this.adb.curDeviceId;
    }
    async selectDevice(deviceId) {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        this.adb.setDeviceId(deviceId);
    }
    async connectOverWifi() {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        const ipRoute = await this.adb.shell('ip route');
        const ipSplits = ipRoute.split(' ');
        const ip = ipSplits[ipSplits.length - 1];
        await this.adb.adbExec(['tcpip', '5555']);
        await this.adb.adbExec(['connect', `${ip}:5555`]);
        await this.selectDevice(`${ip}:5555`);
    }
    async getStoragePercentage() {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        const res = await this.adb.shell('df /storage/emulated/0');
        const splited = res.split(/ +/g).filter((t) => t.length > 0);
        const used = Number(splited[8]);
        const available = Number(splited[9]);
        return (used / (used + available)) * 100;
    }
    async generateStorageBatch(batches, imgRatio, xmpRatio) {
        const ratioSum = imgRatio + xmpRatio;
        const sources = ['img.jpeg', 'xmp.jpeg'];
        const sourcesRatio = [imgRatio, xmpRatio];
        const sourceCounts = {};
        sources.forEach((source, i) => {
            sourceCounts[source] = Math.round((sourcesRatio[i] / ratioSum) * batches);
        });
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        await this.shell('mkdir -p /sdcard/DCIM');
        for (const source of sources) {
            console.log('push', source);
            await this.adb.push(path.resolve(const_1.sourcesPath, source), `/sdcard/DCIM/${source}`);
            await (0, utils_1.sleep)(1000);
        }
        await this.shell('rm -rf /sdcard/DCIM/batch');
        await this.shell('mkdir -p /sdcard/DCIM/batch');
        for (const source in sourceCounts) {
            const count = sourceCounts[source];
            for (let i = 0; i < count; i++) {
                const indexString = i.toString().padStart(3, '0');
                await this.shell(`cp /sdcard/DCIM/${source} /sdcard/DCIM/batch/${indexString}-${source}`);
            }
        }
        return {
            count: sourceCounts,
        };
    }
    async copyBatchOfImages(repeat = 10) {
        for (let i = 0; i < repeat; i++) {
            const timestamp = (0, date_fns_1.format)(new Date(), 'yyyyMMdd-HHmmss');
            await this.shell([
                `mkdir -p /sdcard/DCIM/batch-${timestamp}`,
                `sleep 1`,
                `cp -r /sdcard/DCIM/batch/. /sdcard/DCIM/batch-${timestamp}`,
            ].join(' && '));
        }
    }
    async fillStorage(targetPercent) {
        let currentPercent = await this.getStoragePercentage();
        let diff = targetPercent - currentPercent;
        let unchangedCount = 0;
        while (diff > 0) {
            await this.copyBatchOfImages();
            const newPercent = await this.getStoragePercentage();
            console.log('[Fill Storage]', 'newPercent', newPercent);
            if (newPercent === currentPercent) {
                unchangedCount++;
                if (unchangedCount >= 10) {
                    throw new Error('스토리지 증가가 10번 연속으로 확인되지 않았습니다.');
                }
            }
            else {
                unchangedCount = 0;
            }
            currentPercent = newPercent;
            diff = targetPercent - currentPercent;
        }
    }
    async removeStorage(targetPercent) {
        let currentPercent = await this.getStoragePercentage();
        let diff = currentPercent - targetPercent;
        let unchangedCount = 0;
        while (diff > 0) {
            await this.removeImages(3);
            const newPercent = await this.getStoragePercentage();
            console.log('[Drain Storage]', 'newPercent', newPercent);
            if (newPercent === currentPercent) {
                unchangedCount++;
                if (unchangedCount >= 10) {
                    throw new Error('스토리지 감소가 10번 연속으로 확인되지 않았습니다.');
                }
            }
            else {
                unchangedCount = 0;
            }
            currentPercent = newPercent;
            diff = currentPercent - targetPercent;
        }
    }
    async adjustStorage(targetPercent) {
        const currentPercent = await this.getStoragePercentage();
        const diff = targetPercent - currentPercent;
        if (diff > 0) {
            await this.fillStorage(targetPercent);
        }
        else if (diff < 0) {
            await this.removeStorage(targetPercent);
        }
    }
    async removeImages(second = 3) {
        try {
            await this.shell(`timeout ${second} rm -rf /sdcard/DCIM/batch-*`);
        }
        catch (e) { }
    }
    async getMetrics() {
        if (!this.isMetric)
            return;
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        const cpuRaw = await this.adb.shell('dumpsys cpuinfo');
        const cpu = Number(cpuRaw.slice(0, 10).split(' ')[1]);
        const memRaw = await this.adb.shell('free');
        const memSplit = memRaw.split('\n')[1].replace(/ +/g, ' ').split(' ');
        const [, total, used, free, shared, buff] = memSplit;
        const mem = {
            total: Number(total),
            used: Number(used),
            free: Number(free),
            shared: Number(shared),
            buff: Number(buff),
        };
        const diskRaw = await this.adb.shell('df /storage/emulated/0');
        const lines = diskRaw.split('\n');
        const lastLine = lines[lines.length - 1];
        const parts = lastLine.split(/\s+/);
        const disk = {
            used: Number(parts[2]),
            available: Number(parts[3]),
        };
        disk.percent = (disk.used / (disk.used + disk.available)) * 100;
        const pendingCount = await this.getCountOfPending();
        const externalDbImageCount = await this.getCountOfImages();
        const externalDbSize = await this.getExternalDbSize();
        const externalDbFragmentation = await this.getExternalDbFragmentation();
        const fsImageCount = await this.fsImageCount();
        return this.convertToJsonPrometheusMetrics({
            cpu,
            mem,
            disk,
            pendingCount,
            externalDbImageCount,
            externalDbSize,
            externalDbFragmentation,
            fsImageCount,
        });
    }
    async metricsOn(isMetric) {
        this.isMetric = isMetric;
    }
    convertToJsonPrometheusMetrics(data) {
        return `# HELP cpu_usage CPU 사용량
# TYPE cpu_usage gauge
cpu_usage ${data.cpu}

# HELP mem_total 전체 메모리
# TYPE mem_total gauge
mem_total ${data.mem.total}

# HELP mem_used 사용 중인 메모리
# TYPE mem_used gauge
mem_used ${data.mem.used}

# HELP mem_free 사용 가능한 메모리
# TYPE mem_free gauge
mem_free ${data.mem.free}

# HELP disk_used 사용 중인 디스크 공간
# TYPE disk_used gauge
disk_used ${data.disk.used}

# HELP disk_available 사용 가능한 디스크 공간
# TYPE disk_available gauge
disk_available ${data.disk.available}

# HELP disk_usage_percent 디스크 사용률
# TYPE disk_usage_percent gauge
disk_usage_percent ${data.disk.percent}

# HELP pending_count pending_count
# TYPE pending_count gauge
pending_count ${data.pendingCount}

# HELP externaldb_image_count externaldb_image_count
# TYPE externaldb_image_count gauge
externaldb_image_count ${data.externalDbImageCount}

# HELP external_db_size external_db_size
# TYPE external_db_size gauge
external_db_size ${data.externalDbSize}

# HELP external_db_fragmentation external_db_fragmentation
# TYPE external_db_fragmentation gauge
external_db_fragmentation ${data.externalDbFragmentation}

# HELP fs_image_count fs_image_count
# TYPE fs_image_count gauge
fs_image_count ${data.fsImageCount}
`;
    }
    async getExternalDbSize() {
        const str = await this.shell(`du -b ${const_1.AndroidPath.ExternalDB}`);
        const size = str.split('\t')[0];
        return size;
    }
    async getCountOfPending() {
        return await this.executeSqliteQuery(`SELECT COUNT(*) FROM images WHERE is_pending = 1;`);
    }
    async getCountOfImages() {
        return await this.executeSqliteQuery(`SELECT COUNT(*) FROM images;`);
    }
    async getExternalDbFragmentation(dbPath = const_1.AndroidPath.ExternalDB) {
        const str = await this.shell(`f2fs.fibmap ${dbPath} | tail -n +17 | wc -l`);
        return Number(str);
    }
    async createTrigger() {
        return await this.executeSqliteQuery(`CREATE TRIGGER files_update AFTER UPDATE ON files BEGIN SELECT _UPDATE(old.volume_name||':'||old._id||':'||old.media_type||':'||old.is_download||':'||new._id||':'||new.media_type||':'||new.is_download||':'||old.is_trashed||':'||new.is_trashed||':'||old.is_pending||':'||new.is_pending||':'||old.is_favorite||':'||new.is_favorite||':'||ifnull(old._special_format,0)||':'||ifnull(new._special_format,0)||':'||ifnull(old.owner_package_name,'null')||':'||ifnull(new.owner_package_name,'null')||':'||old._data); END;`);
    }
    async dropTrigger() {
        return await this.executeSqliteQuery(`DROP TRIGGER IF EXISTS files_update;`);
    }
    async externalDbFragmentate(batch, repeat) {
        await this.dropTrigger();
        await (0, utils_1.sleep)(1000);
        try {
            for (let i = 0; i < repeat; i++) {
                const queries = [
                    `UPDATE local_metadata SET generation = generation;`,
                    `UPDATE android_metadata SET locale = locale;`,
                    `UPDATE thumbnails SET _data = _data, image_id = image_id, kind = kind, width = width, height = height WHERE _id = _id;`,
                    `UPDATE album_art SET _data = _data WHERE album_id = album_id;`,
                    `UPDATE videothumbnails SET _data = _data, video_id = video_id, kind = kind, width = width, height = height WHERE _id = _id;`,
                    `UPDATE files SET _data = _data, _size = _size, format = format, parent = parent, date_added = date_added, date_modified = date_modified, mime_type = mime_type, title = title, description = description, _display_name = _display_name, picasa_id = picasa_id, orientation = orientation, latitude = latitude, longitude = longitude, datetaken = datetaken, mini_thumb_magic = mini_thumb_magic, bucket_id = bucket_id, bucket_display_name = bucket_display_name, isprivate = isprivate, title_key = title_key, artist_id = artist_id, album_id = album_id, composer = composer, track = track, year = year, is_ringtone = is_ringtone, is_music = is_music, is_alarm = is_alarm, is_notification = is_notification, is_podcast = is_podcast, album_artist = album_artist, duration = duration, bookmark = bookmark, artist = artist, album = album, resolution = resolution, tags = tags, category = category, language = language, mini_thumb_data = mini_thumb_data, name = name, media_type = media_type, old_id = old_id, is_drm = is_drm, width = width, height = height, title_resource_uri = title_resource_uri, owner_package_name = owner_package_name, color_standard = color_standard, color_transfer = color_transfer, color_range = color_range, _hash = _hash, is_pending = is_pending, is_download = is_download, download_uri = download_uri, referer_uri = referer_uri, is_audiobook = is_audiobook, date_expires = date_expires, is_trashed = is_trashed, group_id = group_id, primary_directory = primary_directory, secondary_directory = secondary_directory, document_id = document_id, instance_id = instance_id, original_document_id = original_document_id, relative_path = relative_path, volume_name = volume_name, artist_key = artist_key, album_key = album_key, genre = genre, genre_key = genre_key, genre_id = genre_id, author = author, bitrate = bitrate, capture_framerate = capture_framerate, cd_track_number = cd_track_number, compilation = compilation, disc_number = disc_number, is_favorite = is_favorite, num_tracks = num_tracks, writer = writer, exposure_time = exposure_time, f_number = f_number, iso = iso, scene_capture_type = scene_capture_type, generation_added = generation_added, generation_modified = generation_modified, xmp = xmp, _transcode_status = _transcode_status, _video_codec_type = _video_codec_type, _modifier = _modifier, is_recording = is_recording, redacted_uri_id = redacted_uri_id, _user_id = _user_id, _special_format = _special_format WHERE _id = _id;`,
                    `UPDATE sqlite_sequence SET name = name, seq = seq;`,
                    `UPDATE log SET time = time, message = message;`,
                    `UPDATE deleted_media SET old_id = old_id, generation_modified = generation_modified WHERE _id = _id;`,
                    `UPDATE audio_playlists_map SET audio_id = audio_id, playlist_id = playlist_id, play_order = play_order WHERE _id = _id;`,
                ];
                for (let j = 0; j < batch; j++) {
                    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
                    let query = `BEGIN TRANSACTION;`;
                    query += randomQuery;
                    query += `COMMIT;`;
                    await this.executeSqliteQuery(query);
                }
            }
        }
        finally {
            await this.createTrigger();
        }
    }
    async adjustPendingCount(targetPercent) {
        await this.executeSqliteQuery(`WITH RowCount AS (
        SELECT CAST(COUNT(*) * ${targetPercent} / 100.0 AS INTEGER) AS TargetCount
        FROM files
      ),
      SelectedRows AS (
        SELECT _id
        FROM files, RowCount
        ORDER BY _id
        LIMIT (SELECT TargetCount FROM RowCount)
      )
      UPDATE files
      SET is_pending = CASE WHEN _id IN (SELECT _id FROM SelectedRows) THEN 1 ELSE 0 END;`);
    }
    async fsImageCount() {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        const imageCountInBatch = Number(await this.adb.shell('ls -l /sdcard/DCIM/batch | tail -n +2 | wc -l'));
        const batchCount = Number(await this.adb.shell('ls -l /sdcard/DCIM | grep "batch-" | tail -n +2 | wc -l'));
        return imageCountInBatch * batchCount;
    }
    async dropCache() {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        await this.shell('echo 3 > /proc/sys/vm/drop_caches');
    }
    async broadcastRefresh() {
        return await this.shell('am broadcast -a android.intent.action.MEDIA_MOUNTED -d file:///sdcard');
    }
    async reboot() {
        return await this.adb.reboot();
    }
    async pushQuery() {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        await this.shell('rm -rf /sdcard/queries');
        await this.pushFile(path.join(const_1.sourcesPath, 'queries'), const_1.AndroidPath.Query);
    }
    async pushFile(localPath, remotePath) {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        await this.adb.push(localPath, remotePath);
    }
    async pullFile(androidPath, hostPath) {
        if (!this.adb) {
            throw new Error('adb is not initialized');
        }
        const tmpPath = `/sdcard/tmp-${Math.floor(Math.random() * 10000)}`;
        try {
            console.log('1', hostPath);
            const folder = path.dirname(hostPath);
            console.log('2', folder);
            await fs.promises.mkdir(folder, { recursive: true });
            console.log('3');
            await this.shell(`cp ${androidPath} ${tmpPath}`);
            console.log('4');
            await this.adb.pull(`${tmpPath}`, hostPath);
            console.log('5');
        }
        catch (e) {
            console.error(e);
            return e;
        }
        finally {
            await this.shell(`if [ -f ${tmpPath} ]; then rm ${tmpPath}; fi`);
        }
    }
    async factoryReset() {
        throw new common_1.NotImplementedException('아직 구현중입니다.');
        await this.adb.shell('recovery --wipe_data');
    }
    async getDbList() {
        const dbsStr = await this.shell(`ls -1 /data/user/0/com.android.providers.media.module/databases | grep "external\."`);
        const dbs = dbsStr.split('\n').filter(db => db);
        const fullPathDbs = dbs.map(db => `/data/user/0/com.android.providers.media.module/databases/${db}`);
        return fullPathDbs;
    }
};
exports.AdbController = AdbController;
__decorate([
    (0, common_1.Post)('initalize'),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "adbInitalize", null);
__decorate([
    openapi.ApiOperation({ summary: "Executes a shell command on the connected device." }),
    (0, common_1.Post)('shell'),
    openapi.ApiResponse({ status: 201, type: String }),
    __param(0, (0, common_1.Query)('command')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "shell", null);
__decorate([
    openapi.ApiOperation({ summary: "Executes a SQLite query on the connected device." }),
    (0, common_1.Post)('sqlite'),
    openapi.ApiResponse({ status: 201, type: String }),
    __param(0, (0, common_1.Query)('sql')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "executeSqliteQuery", null);
__decorate([
    openapi.ApiOperation({ summary: "Executes a SQLite query on the connected device." }),
    (0, common_1.Post)('sqlite/benchmark'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Query)('sql')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "executeSqliteQueryBenchmark", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves a list of connected devices." }),
    (0, common_1.Get)('devices'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "getDevices", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves the selected device ID." }),
    (0, common_1.Get)('devices/selected'),
    openapi.ApiResponse({ status: 200, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "getSelectedDeviceId", null);
__decorate([
    openapi.ApiOperation({ summary: "Selects a device by its device ID." }),
    (0, common_1.Post)('devices/:deviceId/select'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "selectDevice", null);
__decorate([
    openapi.ApiOperation({ summary: "Connects to a device over WiFi." }),
    (0, common_1.Post)('device/connect-over-wifi'),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "connectOverWifi", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves the storage percentage used on the device." }),
    (0, common_1.Get)('storage/percentage'),
    openapi.ApiResponse({ status: 200, type: Number }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "getStoragePercentage", null);
__decorate([
    openapi.ApiOperation({ summary: "Generates a batch of storage files." }),
    (0, common_1.Post)('storage/generate-batch'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Query)('batches')),
    __param(1, (0, common_1.Query)('imgRatio')),
    __param(2, (0, common_1.Query)('xmpRatio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "generateStorageBatch", null);
__decorate([
    openapi.ApiOperation({ summary: "Fills the storage to a specified percentage by duplicating a batch folder." }),
    (0, common_1.Post)('storage/fill'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Query)('targetPercentage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "fillStorage", null);
__decorate([
    openapi.ApiOperation({ summary: "Drains the storage to a specified percentage by removing images from a cloned batch." }),
    (0, common_1.Post)('storage/drain'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Query)('targetPercentage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "removeStorage", null);
__decorate([
    openapi.ApiOperation({ summary: "Adjusts the storage to a specified percentage." }),
    (0, common_1.Post)('storage/adjust'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Query)('targetPercentage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "adjustStorage", null);
__decorate([
    openapi.ApiOperation({ summary: "Returns Prometheus formatted metrics." }),
    (0, common_1.Get)('metrics'),
    openapi.ApiResponse({ status: 200, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "getMetrics", null);
__decorate([
    openapi.ApiOperation({ summary: "Toggles the metrics on or off." }),
    (0, common_1.Put)('metrics'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('isMetric')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "metricsOn", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves the size of the external database." }),
    (0, common_1.Get)('external-db/size'),
    openapi.ApiResponse({ status: 200, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "getExternalDbSize", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves the count of pending images in the external database." }),
    (0, common_1.Get)('external-db/pending-count'),
    openapi.ApiResponse({ status: 200, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "getCountOfPending", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves the count of images in the external database." }),
    (0, common_1.Get)('external-db/image-count'),
    openapi.ApiResponse({ status: 200, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "getCountOfImages", null);
__decorate([
    openapi.ApiOperation({ summary: "Retrieves the fragmentation level of the external database." }),
    (0, common_1.Get)('external-db/fragmentation'),
    openapi.ApiResponse({ status: 200, type: Number }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "getExternalDbFragmentation", null);
__decorate([
    openapi.ApiOperation({ summary: "Creates a trigger for the files table in the external database." }),
    (0, common_1.Post)('external-db/trigger'),
    openapi.ApiResponse({ status: 201, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "createTrigger", null);
__decorate([
    openapi.ApiOperation({ summary: "Removes a trigger for the files table in the external database." }),
    (0, common_1.Delete)('external-db/trigger'),
    openapi.ApiResponse({ status: 200, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "dropTrigger", null);
__decorate([
    openapi.ApiOperation({ summary: "Fragments the external database by updating file records." }),
    (0, common_1.Post)('external-db/fragmentate'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Query)('batch')),
    __param(1, (0, common_1.Query)('repeat')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "externalDbFragmentate", null);
__decorate([
    (0, common_1.Post)('external-db/pending-count/adjust'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Query)('targetPercent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "adjustPendingCount", null);
__decorate([
    openapi.ApiOperation({ summary: "Counts the number of images in the file system's batch directory." }),
    (0, common_1.Get)('fs/image-count'),
    openapi.ApiResponse({ status: 200, type: Number }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "fsImageCount", null);
__decorate([
    openapi.ApiOperation({ summary: "Drops the cache on the device." }),
    (0, common_1.Post)('drop-cache'),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "dropCache", null);
__decorate([
    openapi.ApiOperation({ summary: "Broadcasts a refresh to the media storage." }),
    (0, common_1.Post)('broadcast-refresh'),
    openapi.ApiResponse({ status: 201, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "broadcastRefresh", null);
__decorate([
    openapi.ApiOperation({ summary: "Reboots the device." }),
    (0, common_1.Post)('reboot'),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "reboot", null);
__decorate([
    openapi.ApiOperation({ summary: "Pushes a query file to the device." }),
    (0, common_1.Put)('push-query'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "pushQuery", null);
__decorate([
    openapi.ApiOperation({ summary: "Pulls a database file from the remote device to the local system using a temporary file." }),
    (0, common_1.Post)('pull-db-file'),
    (0, swagger_1.ApiQuery)({
        name: 'androidPath',
        required: true,
        description: 'The path of the database file on the android device.',
        example: const_1.AndroidPath.ExternalDB,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hostPath',
        required: true,
        description: 'The destination path on the host system.',
        example: `${const_1.HostPath.Workspace}/external.db`,
    }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Query)('androidPath')),
    __param(1, (0, common_1.Query)('hostPath')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "pullFile", null);
__decorate([
    openapi.ApiOperation({ summary: "Initiates a factory reset on the remote device." }),
    (0, common_1.Post)('factory-reset'),
    openapi.ApiResponse({ status: 201 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "factoryReset", null);
__decorate([
    (0, common_1.Get)('db-list'),
    openapi.ApiResponse({ status: 200, type: [String] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdbController.prototype, "getDbList", null);
exports.AdbController = AdbController = __decorate([
    (0, swagger_1.ApiTags)('MISC-adb'),
    (0, common_1.Controller)('adb'),
    __metadata("design:paramtypes", [work_repository_1.WorkRepository])
], AdbController);
//# sourceMappingURL=adb.controller.js.map