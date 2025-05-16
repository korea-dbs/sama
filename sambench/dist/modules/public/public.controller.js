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
exports.PublicController = void 0;
const openapi = require("@nestjs/swagger");
const adb_controller_1 = require("../adb/adb.controller");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let PublicController = class PublicController {
    constructor(adb) {
        this.adb = adb;
    }
    async adjustAll(targetStoragePercent, targetFragmantationPercent, cpuIntencive) {
        throw new common_1.NotImplementedException();
    }
    async configWork(configId, queryId, capacity) {
        throw new common_1.NotImplementedException();
    }
};
exports.PublicController = PublicController;
__decorate([
    openapi.ApiOperation({ summary: "Adjusts multiple settings of the device." }),
    (0, swagger_1.ApiTags)('Configurations'),
    (0, common_1.Post)('config'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Query)('Capacity')),
    __param(1, (0, common_1.Query)('Fragmentation')),
    __param(2, (0, common_1.Query)('CPU-intensive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "adjustAll", null);
__decorate([
    (0, swagger_1.ApiTags)('Evaluate'),
    (0, common_1.Post)('evaluate'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Query)('Config-id')),
    __param(1, (0, common_1.Query)('Query-id')),
    __param(2, (0, common_1.Query)('Capacity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "configWork", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [adb_controller_1.AdbController])
], PublicController);
//# sourceMappingURL=public.controller.js.map