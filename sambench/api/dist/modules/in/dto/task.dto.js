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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class TaskDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { queries: { required: true, type: () => [String] } };
    }
}
exports.TaskDto = TaskDto;
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    (0, swagger_1.ApiProperty)({
        type: [String],
        example: [
            "s1.sql",
            "i2.sql",
            "m1.sql",
            "g1.sql",
            "t2.sql"
        ],
    }),
    __metadata("design:type", Array)
], TaskDto.prototype, "queries", void 0);
//# sourceMappingURL=task.dto.js.map