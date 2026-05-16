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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
let HealthController = class HealthController {
    health;
    disk;
    memory;
    configService;
    db;
    microservice;
    constructor(health, disk, memory, configService, db, microservice) {
        this.health = health;
        this.disk = disk;
        this.memory = memory;
        this.configService = configService;
        this.db = db;
        this.microservice = microservice;
    }
    check() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
            () => this.db.pingCheck('database'),
            () => this.microservice.pingCheck('redis', {
                transport: microservices_1.Transport.REDIS,
                options: {
                    host: this.configService.get('REDIS_HOST') || 'localhost',
                    port: this.configService.get('REDIS_PORT') || 6379,
                },
            }),
            () => this.microservice.pingCheck('messaging', {
                transport: microservices_1.Transport.KAFKA,
                options: {
                    client: {
                        brokers: (this.configService.get('KAFKA_BROKERS') || 'localhost:9092').split(','),
                    },
                },
            }),
        ]);
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [terminus_1.HealthCheckService,
        terminus_1.DiskHealthIndicator,
        terminus_1.MemoryHealthIndicator,
        config_1.ConfigService,
        terminus_1.TypeOrmHealthIndicator,
        terminus_1.MicroserviceHealthIndicator])
], HealthController);
//# sourceMappingURL=health.controller.js.map