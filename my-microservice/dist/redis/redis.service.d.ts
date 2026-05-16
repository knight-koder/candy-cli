import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
export declare class RedisService {
    private readonly cache;
    private readonly configService;
    constructor(cache: Cache, configService: ConfigService);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    setNX<T>(key: string, value: T, ttl?: number): Promise<boolean>;
}
