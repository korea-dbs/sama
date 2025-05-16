"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InModule = void 0;
const common_1 = require("@nestjs/common");
const out_module_1 = require("../out/out.module");
const host_controller_1 = require("./host.controller");
const setup_controller_1 = require("./setup.controller");
const work_controller_1 = require("./work.controller");
const adb_controller_1 = require("./adb.controller");
let InModule = class InModule {
};
exports.InModule = InModule;
exports.InModule = InModule = __decorate([
    (0, common_1.Module)({
        imports: [out_module_1.OutModule],
        controllers: [setup_controller_1.SetupController, adb_controller_1.AdbController, host_controller_1.HostController, work_controller_1.WorkController],
        providers: [setup_controller_1.SetupController, adb_controller_1.AdbController, host_controller_1.HostController, work_controller_1.WorkController],
    })
], InModule);
//# sourceMappingURL=in.module.js.map