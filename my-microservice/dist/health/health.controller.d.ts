import { HealthCheckService, DiskHealthIndicator, MemoryHealthIndicator, TypeOrmHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
export declare class HealthController {
    private health;
    private disk;
    private memory;
    private configService;
    private db;
    private microservice;
    constructor(health: HealthCheckService, disk: DiskHealthIndicator, memory: MemoryHealthIndicator, configService: ConfigService, db: TypeOrmHealthIndicator, microservice: MicroserviceHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"messaging"> & import("@nestjs/terminus").HealthIndicatorResult<"redis"> & import("@nestjs/terminus").HealthIndicatorResult<"database"> & import("@nestjs/terminus").HealthIndicatorResult<"storage"> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap">, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"messaging"> & import("@nestjs/terminus").HealthIndicatorResult<"redis"> & import("@nestjs/terminus").HealthIndicatorResult<"database"> & import("@nestjs/terminus").HealthIndicatorResult<"storage"> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap">> | undefined, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & import("@nestjs/terminus").HealthIndicatorResult<"messaging"> & import("@nestjs/terminus").HealthIndicatorResult<"redis"> & import("@nestjs/terminus").HealthIndicatorResult<"database"> & import("@nestjs/terminus").HealthIndicatorResult<"storage"> & import("@nestjs/terminus").HealthIndicatorResult<"memory_heap">> | undefined>>;
}
