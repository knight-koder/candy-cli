"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Joi = __importStar(require("joi"));
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const health_module_1 = require("./health/health.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const kafka_module_1 = require("./kafka/kafka.module");
const kafka_consumer_1 = require("./kafka/kafka.consumer");
const redis_module_1 = require("./redis/redis.module");
const database_module_1 = require("./database/postgres/database.module");
const examples_module_1 = require("./examples/examples.module");
const logger_module_1 = require("./logger/logger.module");
const prometheus_module_1 = require("./observability/prometheus.module");
const resiliency_module_1 = require("./resiliency/resiliency.module");
let AppModule = class AppModule {
    configure(consumer) {
        if (process.env.NODE_ENV !== 'production') {
            try {
                const morgan = require('morgan');
                consumer.apply(morgan('dev')).forRoutes('*');
            }
            catch (e) {
            }
        }
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: Joi.object({
                    NODE_ENV: Joi.string()
                        .valid('development', 'production', 'test')
                        .default('development'),
                    PORT: Joi.number().default(3000),
                    CORS_ORIGIN: Joi.string().default(''),
                    THROTTLE_TTL: Joi.number().default(60000),
                    THROTTLE_LIMIT: Joi.number().default(100),
                    POSTGRES_HOST: Joi.string().required(),
                    POSTGRES_PORT: Joi.number().default(5432),
                    POSTGRES_USER: Joi.string().required(),
                    POSTGRES_PASSWORD: Joi.string().required(),
                    POSTGRES_DB: Joi.string().required(),
                    KAFKA_BROKERS: Joi.string().required(),
                    KAFKA_SSL: Joi.boolean().default(false),
                    REDIS_HOST: Joi.string().default('localhost'),
                    REDIS_PORT: Joi.number().default(6379),
                }),
            }),
            health_module_1.HealthModule,
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule, redis_module_1.RedisModule],
                inject: [config_1.ConfigService, 'REDIS_CLIENT'],
                useFactory: (configService, redisClient) => {
                    const ttl = configService.get('THROTTLE_TTL') ?? 60000;
                    const limit = configService.get('THROTTLE_LIMIT') ?? 100;
                    const storagePkg = require('@nest-lab/throttler-storage-redis');
                    const RedisStorage = storagePkg.ThrottlerStorageRedisService || storagePkg.ThrottlerStorageRedis || storagePkg;
                    return {
                        throttlers: [{ ttl, limit }],
                        storage: new RedisStorage(redisClient),
                    };
                },
            }),
            kafka_module_1.KafkaModule,
            redis_module_1.RedisModule,
            database_module_1.PostgresDatabaseModule,
            examples_module_1.ExamplesModule,
            logger_module_1.LoggerModule,
            prometheus_module_1.MetricsModule,
            resiliency_module_1.ResiliencyModule,
        ],
        controllers: [
            app_controller_1.AppController,
            kafka_consumer_1.KafkaConsumerController,
        ],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map