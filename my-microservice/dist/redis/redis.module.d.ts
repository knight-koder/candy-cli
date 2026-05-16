import { Redis } from 'ioredis';
import { OnModuleDestroy } from '@nestjs/common';
export declare const REDIS_CLIENT = "REDIS_CLIENT";
export declare class RedisModule implements OnModuleDestroy {
    private readonly redisClient;
    constructor(redisClient: Redis);
    onModuleDestroy(): Promise<void>;
}
