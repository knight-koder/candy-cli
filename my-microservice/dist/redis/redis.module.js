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
exports.RedisModule = exports.REDIS_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const cache_manager_redis_store_1 = require("cache-manager-redis-store");
const redis_service_1 = require("./redis.service");
const ioredis_1 = require("ioredis");
const common_2 = require("@nestjs/common");
exports.REDIS_CLIENT = 'REDIS_CLIENT';
let RedisModule = class RedisModule {
    redisClient;
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    async onModuleDestroy() {
        await this.redisClient.quit();
    }
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    store: cache_manager_redis_store_1.redisStore,
                    host: configService.get('REDIS_HOST') || 'localhost',
                    port: configService.get('REDIS_PORT') || 6379,
                    password: configService.get('REDIS_PASSWORD'),
                    ttl: configService.get('REDIS_TTL') || 60,
                }),
            }),
        ],
        providers: [
            redis_service_1.RedisService,
            {
                provide: exports.REDIS_CLIENT,
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    return new ioredis_1.Redis({
                        host: configService.get('REDIS_HOST') || 'localhost',
                        port: configService.get('REDIS_PORT') || 6379,
                        password: configService.get('REDIS_PASSWORD'),
                    });
                },
            },
        ],
        exports: [redis_service_1.RedisService, exports.REDIS_CLIENT],
    }),
    __param(0, (0, common_2.Inject)(exports.REDIS_CLIENT)),
    __metadata("design:paramtypes", [ioredis_1.Redis])
], RedisModule);
//# sourceMappingURL=redis.module.js.map