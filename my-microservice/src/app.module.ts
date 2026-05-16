import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';



import { AppController } from './app.controller';
import { AppService } from './app.service';









import { KafkaModule } from './kafka/kafka.module';
import { KafkaConsumerController } from './kafka/kafka.consumer';







import { RedisModule } from './redis/redis.module';




import { PostgresDatabaseModule } from './database/postgres/database.module';








import { ExamplesModule } from './examples/examples.module';



import { LoggerModule } from './logger/logger.module';



import { MetricsModule } from './observability/prometheus.module';



import { ResiliencyModule } from './resiliency/resiliency.module';


@Module({
    imports: [
        ConfigModule.forRoot({
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
        HealthModule,
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule, RedisModule],
            inject: [ConfigService, 'REDIS_CLIENT'],
            useFactory: (configService: ConfigService, redisClient: any) => {
                const ttl = configService.get<number>('THROTTLE_TTL') ?? 60000;
                const limit = configService.get<number>('THROTTLE_LIMIT') ?? 100;


                const storagePkg = require('@nest-lab/throttler-storage-redis');
                const RedisStorage = storagePkg.ThrottlerStorageRedisService || storagePkg.ThrottlerStorageRedis || storagePkg;
                return {
                    throttlers: [{ ttl, limit }],
                    storage: new RedisStorage(redisClient),
                };

            },
        }),




        KafkaModule,




        RedisModule,



        PostgresDatabaseModule,







        ExamplesModule,


        LoggerModule,


        MetricsModule,


        ResiliencyModule,

    ],
    controllers: [

        AppController,


        KafkaConsumerController,


    ],
    providers: [

        AppService,

        // Applies ThrottlerGuard globally to all routes
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {


        if (process.env.NODE_ENV !== 'production') {
            try {
                const morgan = require('morgan');
                consumer.apply(morgan('dev')).forRoutes('*');
            } catch (e) {
                // morgan not installed
            }
        }

        // Pino handles its own middleware via the LoggerModule (nestjs-pino)

    }
}
