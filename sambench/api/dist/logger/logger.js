"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyLogger = void 0;
const common_1 = require("@nestjs/common");
let MyLogger = class MyLogger {
    debug(message, context, ...optionalParams) {
        console.debug('[Nest]', message);
    }
    error(message, trace, context, ...optionalParams) {
        console.error('[Nest]', message);
        console.trace(trace);
    }
    log(message, context, ...optionalParams) {
        if (context === 'NestFactory')
            return;
        if (context === 'InstanceLoader')
            return;
        if (context === 'RoutesResolver')
            return;
        if (context === 'RouterExplorer')
            return;
        if (context === 'NestMicroservice')
            return;
        console.log('[Nest]', message);
    }
    warn(message, context, ...optionalParams) {
        console.warn('[Nest]', message);
    }
    verbose(message, context, ...optionalParams) {
        console.log('[Nest]', message);
    }
};
exports.MyLogger = MyLogger;
exports.MyLogger = MyLogger = __decorate([
    (0, common_1.Injectable)()
], MyLogger);
//# sourceMappingURL=logger.js.map