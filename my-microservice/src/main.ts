

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  
  // ─── HTTP Application Setup ────────────────────────────────────────────────
  
  const app = await NestFactory.create(AppModule);
  
  
  const configService = app.get(ConfigService);

  // CORS: restrict to the configured origin in production
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin || false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Exclude /health from api/v1 prefix so K8s liveness/readiness probes work
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  // Global validation pipe — reject unknown fields and validate all DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableShutdownHooks();

  
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  

  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('my-microservice API')
    .setDescription('my-microservice microservice API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  

  // ─── Hybrid Microservice Connections ──────────────────────────────────────
  
  
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'my-microservice',
        brokers: (configService.get<string>('KAFKA_BROKERS') || 'localhost:9092').split(','),
        retry: {
          initialRetryTime: 1000,
          retries: 30,
        },
      },
      consumer: { groupId: 'my-microservice-consumer' },
    },
  });
  
  

  // Initialize the app first to ensure all onModuleInit hooks (like Kafka topic creation)
  // complete BEFORE the microservice consumers attempt to connect and subscribe.
  await app.init();
  await app.startAllMicroservices();
  logger.log('All connected microservices started');
  

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  
  logger.log(`my-microservice service running on port ${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);

  
}

bootstrap();