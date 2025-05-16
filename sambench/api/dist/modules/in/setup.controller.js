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
exports.SetupController = void 0;
const openapi = require("@nestjs/swagger");
const adb_controller_1 = require("./adb.controller");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path = require("path");
const const_1 = require("../../utils/const");
const utils_1 = require("../../utils/utils");
let SetupController = class SetupController {
    constructor(adbService) {
        this.adbService = adbService;
    }
    async generateStorageBatch(batches = 100, imgRatio = 90, xmpRatio = 10) {
        const ratioSum = imgRatio + xmpRatio;
        const sources = ['img.jpeg', 'xmp.jpeg'];
        const sourcesRatio = [imgRatio, xmpRatio];
        const sourceCounts = {};
        sources.forEach((source, i) => {
            sourceCounts[source] = Math.round((sourcesRatio[i] / ratioSum) * batches);
        });
        if (!this.adbService.adb) {
            throw new Error('adb is not initialized');
        }
        await this.adbService.shell('mkdir -p /sdcard/DCIM');
        for (const source of sources) {
            console.log('push', source);
            await this.adbService.adb.push(path.resolve(const_1.sourcesPath, 'images', source), `/sdcard/DCIM/${source}`);
            await (0, utils_1.sleep)(1000);
        }
        await this.adbService.shell('rm -rf /sdcard/DCIM/batch');
        await this.adbService.shell('mkdir -p /sdcard/DCIM/batch');
        for (const source in sourceCounts) {
            const count = sourceCounts[source];
            for (let i = 0; i < count; i++) {
                const indexString = i.toString().padStart(3, '0');
                await this.adbService.shell(`cp /sdcard/DCIM/${source} /sdcard/DCIM/batch/${indexString}-${source}`);
            }
        }
        return {
            count: sourceCounts,
        };
    }
    async pushScripts() {
        const outputs = [];
        outputs.push(await this.adbService.shell('mkdir -p /data/local/fullscan'));
        outputs.push(await this.adbService.pushFile(path.join(const_1.HostPath.Source, 'scripts/cal_blk_offset.sh'), "/data/local/fullscan/cal_blk_offset.sh"));
        outputs.push(await this.adbService.pushFile(path.join(const_1.HostPath.Source, 'scripts/frag_count.sh'), "/data/local/fullscan/frag_count.sh"));
        outputs.push(await this.adbService.pushFile(path.join(const_1.HostPath.Source, 'scripts/max_dis.sh'), "/data/local/fullscan/max_dis.sh"));
        return { message: "스크립트가 성공적으로 업로드되었습니다.", outputs };
    }
    async pushQuery() {
        if (!this.adbService.adb) {
            throw new Error('adb is not initialized');
        }
        await this.adbService.shell('rm -rf /sdcard/queries');
        await this.adbService.pushFile(path.join(const_1.sourcesPath, 'queries'), const_1.AndroidPath.Query);
    }
};
exports.SetupController = SetupController;
__decorate([
    openapi.ApiOperation({ summary: "Generates a batch of storage files." }),
    (0, swagger_1.ApiQuery)({ name: 'batches', type: Number, description: 'The number of batches to generate', required: false, example: 100 }),
    (0, swagger_1.ApiQuery)({ name: 'imgRatio', type: Number, description: 'The ratio of image files', required: false, example: 90 }),
    (0, swagger_1.ApiQuery)({ name: 'xmpRatio', type: Number, description: 'The ratio of XMP files', required: false, example: 10 }),
    (0, common_1.Put)('storage/generate-batch'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('batches')),
    __param(1, (0, common_1.Query)('imgRatio')),
    __param(2, (0, common_1.Query)('xmpRatio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], SetupController.prototype, "generateStorageBatch", null);
__decorate([
    (0, common_1.Put)('storage/push-scripts'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SetupController.prototype, "pushScripts", null);
__decorate([
    openapi.ApiOperation({ summary: "Pushes a query file to the device." }),
    (0, common_1.Put)('storage/push-query'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SetupController.prototype, "pushQuery", null);
exports.SetupController = SetupController = __decorate([
    (0, swagger_1.ApiTags)('Setup'),
    (0, common_1.Controller)('setup'),
    __metadata("design:paramtypes", [adb_controller_1.AdbController])
], SetupController);
//# sourceMappingURL=setup.controller.js.map