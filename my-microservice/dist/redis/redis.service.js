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
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
let RedisService = class RedisService {
    cache;
    configService;
    constructor(cache, configService) {
        this.cache = cache;
        this.configService = configService;
    }
    async get(key) {
        return (await this.cache.get(key)) ?? null;
    }
    async set(key, value, ttl) {
        const resolvedTtl = ttl ?? this.configService.get('REDIS_TTL') ?? 60;
        await this.cache.set(key, value, resolvedTtl);
    }
    async del(key) {
        await this.cache.del(key);
    }
    async exists(key) {
        return (await this.cache.get(key)) !== undefined;
    }
    async setNX(key, value, ttl) {
        const existing = await this.cache.get(key);
        if (existing !== undefined && existing !== null)
            return false;
        await this.set(key, value, ttl);
        return true;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map