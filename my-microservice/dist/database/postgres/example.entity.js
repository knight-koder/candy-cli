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
exports.ExampleEntity = exports.ExampleStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
var ExampleStatus;
(function (ExampleStatus) {
    ExampleStatus["ACTIVE"] = "active";
    ExampleStatus["INACTIVE"] = "inactive";
    ExampleStatus["PENDING"] = "pending";
})(ExampleStatus || (exports.ExampleStatus = ExampleStatus = {}));
let ExampleEntity = class ExampleEntity {
    id;
    name;
    code;
    description;
    priority;
    viewCount;
    externalId;
    price;
    score;
    isActive;
    status;
    birthDate;
    startTime;
    scheduledAt;
    metadata;
    rawPayload;
    tags;
    scores;
    thumbnail;
    createdAt;
    updatedAt;
    deletedAt;
    version;
};
exports.ExampleEntity = ExampleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ExampleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, swagger_1.ApiProperty)({ example: 'My Entity', description: 'The name of the example entity' }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ExampleEntity.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', required: false }),
    (0, typeorm_1.Column)({ type: 'char', length: 3, nullable: true }),
    __metadata("design:type", String)
], ExampleEntity.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A detailed description', required: false }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ExampleEntity.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, default: 0 }),
    (0, typeorm_1.Column)({ type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], ExampleEntity.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, default: 0 }),
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ExampleEntity.prototype, "viewCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], ExampleEntity.prototype, "externalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ExampleEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], ExampleEntity.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, default: true }),
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ExampleEntity.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ExampleStatus, default: ExampleStatus.PENDING }),
    (0, typeorm_1.Column)({ type: 'enum', enum: ExampleStatus, default: ExampleStatus.PENDING }),
    __metadata("design:type", String)
], ExampleEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], ExampleEntity.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", String)
], ExampleEntity.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ExampleEntity.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ExampleEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ExampleEntity.prototype, "rawPayload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], ExampleEntity.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', array: true, nullable: true }),
    __metadata("design:type", Array)
], ExampleEntity.prototype, "scores", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bytea', nullable: true }),
    __metadata("design:type", Buffer)
], ExampleEntity.prototype, "thumbnail", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ExampleEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], ExampleEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ExampleEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)(),
    __metadata("design:type", Number)
], ExampleEntity.prototype, "version", void 0);
exports.ExampleEntity = ExampleEntity = __decorate([
    (0, typeorm_1.Entity)('examples')
], ExampleEntity);
//# sourceMappingURL=example.entity.js.map