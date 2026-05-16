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
exports.ExampleController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const example_entity_1 = require("../../database/postgres/example.entity");
const create_example_dto_1 = require("./dto/create-example.dto");
const update_example_dto_1 = require("./dto/update-example.dto");
const swagger_1 = require("@nestjs/swagger");
let ExampleController = class ExampleController {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }
    async findAll() {
        return await this.repository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const entity = await this.repository.findOne({ where: { id } });
        if (!entity)
            throw new common_1.NotFoundException(`Example with ID ${id} not found`);
        return entity;
    }
    async update(id, data) {
        const entity = await this.findOne(id);
        Object.assign(entity, data);
        return await this.repository.save(entity);
    }
    async remove(id) {
        const entity = await this.findOne(id);
        return await this.repository.remove(entity);
    }
};
exports.ExampleController = ExampleController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a new example' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Created successfully.' }),
    (0, swagger_1.ApiBody)({ type: create_example_dto_1.CreateExampleDto }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_example_dto_1.CreateExampleDto]),
    __metadata("design:returntype", Promise)
], ExampleController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List all examples' }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExampleController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get a single example by ID' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Not found.' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExampleController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update an example' }),
    (0, swagger_1.ApiBody)({ type: update_example_dto_1.UpdateExampleDto }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_example_dto_1.UpdateExampleDto]),
    __metadata("design:returntype", Promise)
], ExampleController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete an example' }),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExampleController.prototype, "remove", null);
exports.ExampleController = ExampleController = __decorate([
    (0, swagger_1.ApiTags)('Examples (Postgres CRUD)'),
    (0, common_1.Controller)('examples/postgres'),
    __param(0, (0, typeorm_1.InjectRepository)(example_entity_1.ExampleEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ExampleController);
//# sourceMappingURL=postgres-example.controller.js.map