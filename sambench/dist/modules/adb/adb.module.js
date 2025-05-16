"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdbModule = void 0;
const work_repository_1 = require("../work/work.repository");
const adb_controller_1 = require("./adb.controller");
const common_1 = require("@nestjs/common");
let AdbModule = class AdbModule {
};
exports.AdbModule = AdbModule;
exports.AdbModule = AdbModule = __decorate([
    (0, common_1.Module)({
        controllers: [adb_controller_1.AdbController],
        providers: [adb_controller_1.AdbController, work_repository_1.WorkRepository],
        exports: [adb_controller_1.AdbController],
    })
], AdbModule);
//# sourceMappingURL=adb.module.js.map