"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const logger_middleware_1 = require("./middleware/logger.middleware");
const adb_module_1 = require("./modules/adb/adb.module");
const host_module_1 = require("./modules/host/host.module");
const public_module_1 = require("./modules/public/public.module");
const work_module_1 = require("./modules/work/work.module");
const common_1 = require("@nestjs/common");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [public_module_1.PublicModule, adb_module_1.AdbModule, host_module_1.HostModule, work_module_1.WorkModule],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map