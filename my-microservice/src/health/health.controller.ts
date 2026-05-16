import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheckService, 
  HealthCheck, 
  DiskHealthIndicator, 
  MemoryHealthIndicator,
  
    TypeOrmHealthIndicator, 
    
  
  MicroserviceHealthIndicator, 
} from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private configService: ConfigService,
    
      private db: TypeOrmHealthIndicator, 
      
    
    private microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Basic checks
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }), // 90% disk usage
      
      // Feature-specific checks
      
        
      () => this.db.pingCheck('database'),
        
        
      

      
      () => this.microservice.pingCheck('redis', {
        transport: Transport.REDIS,
        options: {
          host: this.configService.get<string>('REDIS_HOST') || 'localhost',
          port: this.configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
      

      
      () => this.microservice.pingCheck('messaging', {
        transport: Transport.KAFKA,
        options: {
          
          client: {
            brokers: (this.configService.get<string>('KAFKA_BROKERS') || 'localhost:9092').split(','),
          },
          
        },
      }),
      
    ]);
  }
}
