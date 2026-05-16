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
exports.CreateExampleDto = exports.ExampleStatus = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ExampleStatus;
(function (ExampleStatus) {
    ExampleStatus["ACTIVE"] = "active";
    ExampleStatus["INACTIVE"] = "inactive";
    ExampleStatus["PENDING"] = "pending";
})(ExampleStatus || (exports.ExampleStatus = ExampleStatus = {}));
class CreateExampleDto {
    name;
    description;
    status;
}
exports.CreateExampleDto = CreateExampleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'My Entity', description: 'The name of the entity' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateExampleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A detailed description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExampleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ExampleStatus, default: ExampleStatus.PENDING, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ExampleStatus),
    __metadata("design:type", String)
], CreateExampleDto.prototype, "status", void 0);
//# sourceMappingURL=create-example.dto.js.map