"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CustomExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let CustomExceptionFilter = CustomExceptionFilter_1 = class CustomExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(CustomExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception.message;
        this.logger.error(exception);
        response.status(status).send(exception.message + '\n\n' + exception.stack);
    }
};
exports.CustomExceptionFilter = CustomExceptionFilter;
exports.CustomExceptionFilter = CustomExceptionFilter = CustomExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(Error)
], CustomExceptionFilter);
//# sourceMappingURL=custom-exception-filter.js.map