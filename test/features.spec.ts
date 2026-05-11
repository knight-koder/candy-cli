import { FEATURES } from '../src/generator/features.js';
import { PromptAnswers } from '../src/prompts/index.js';

describe('Features Registry', () => {
  const getFeature = (name: string) => {
    const f = FEATURES.find(f => f.name === name);
    if (!f) throw new Error(`Feature ${name} not found`);
    return f;
  };

  const mockAnswers = (overrides: Partial<PromptAnswers> = {}): PromptAnswers => ({
    projectName: 'test-app',
    packageManager: 'npm',
    protocols: [],
    messagingQueue: false,
    queueType: undefined,
    redisCache: false,
    logger: 'None',
    observability: 'None',
    apiDocs: false,
    opossum: false,
    dlqAndRetries: false,
    ...overrides
  });

  describe('REST', () => {
    const feature = getFeature('REST');

    it('should be enabled only if protocols includes REST', () => {
      expect(feature.condition(mockAnswers({ protocols: ['REST'] }))).toBe(true);
      expect(feature.condition(mockAnswers({ protocols: ['GraphQL'] }))).toBe(false);
    });

    it('should have correct configuration', () => {
      expect(feature.dependencies).toBeUndefined();
      expect(feature.devDependencies).toBeUndefined();
      expect(feature.injection).toBeUndefined();
      
      const files = feature.files!(mockAnswers());
      expect(files).toHaveLength(1);
      expect(files.map(f => f.dest)).toEqual(['src/app.controller.ts']);
    });
  });

  describe('GraphQL', () => {
    const feature = getFeature('GraphQL');

    it('should be enabled only if protocols includes GraphQL', () => {
      expect(feature.condition(mockAnswers({ protocols: ['GraphQL'] }))).toBe(true);
      expect(feature.condition(mockAnswers({ protocols: ['REST'] }))).toBe(false);
    });
    
    it('should have correct configuration', () => {
      expect(feature.dependencies).toEqual(['@nestjs/graphql', '@nestjs/apollo', '@apollo/server', 'graphql', '@as-integrations/express5']);
      expect(feature.injection).toEqual({ moduleName: 'GraphqlModule', importPath: './graphql/graphql.module' });
      
      const files = feature.files!(mockAnswers());
      expect(files).toHaveLength(3);
      expect(files.map(f => f.dest)).toContain('src/graphql/graphql.module.ts');
      expect(files.map(f => f.dest)).toContain('src/graphql/app.resolver.ts');
    });
  });

  describe('gRPC', () => {
    const feature = getFeature('gRPC');

    it('should be enabled only if protocols includes gRPC', () => {
      expect(feature.condition(mockAnswers({ protocols: ['gRPC'] }))).toBe(true);
      expect(feature.condition(mockAnswers({ protocols: ['REST'] }))).toBe(false);
    });

    it('should have correct configuration', () => {
      expect(feature.dependencies).toEqual(expect.arrayContaining(['@nestjs/microservices', '@grpc/grpc-js', '@grpc/proto-loader', 'rxjs']));
      expect(feature.injection).toEqual({ moduleName: 'GrpcClientModule', importPath: './grpc/grpc.module' });
      
      const files = feature.files!(mockAnswers());
      expect(files.map(f => f.dest)).toContain('src/grpc/grpc.module.ts');
      expect(files.map(f => f.dest)).toContain('src/grpc/hero/hero.proto');
    });
  });

  describe('WebSockets', () => {
    const feature = getFeature('WebSockets');

    it('should be enabled only if protocols includes WebSockets', () => {
      expect(feature.condition(mockAnswers({ protocols: ['WebSockets'] }))).toBe(true);
      expect(feature.condition(mockAnswers({ protocols: ['REST'] }))).toBe(false);
    });

    it('should have correct configuration', () => {
      expect(feature.dependencies).toEqual(expect.arrayContaining(['@nestjs/platform-socket.io', '@nestjs/websockets', 'socket.io']));
      expect(feature.injection).toEqual({ moduleName: 'WebSocketsModule', importPath: './websockets/websockets.module' });
      
      const files = feature.files!(mockAnswers());
      expect(files.map(f => f.dest)).toContain('src/websockets/websockets.module.ts');
      expect(files.map(f => f.dest)).toContain('src/websockets/app.gateway.ts');
    });
  });

  describe('RabbitMQ', () => {
    const feature = getFeature('RabbitMQ');

    it('should be enabled only if messagingQueue is true and queueType is RabbitMQ', () => {
      expect(feature.condition(mockAnswers({ messagingQueue: true, queueType: 'RabbitMQ' }))).toBe(true);
      expect(feature.condition(mockAnswers({ messagingQueue: true, queueType: 'Kafka' }))).toBe(false);
      expect(feature.condition(mockAnswers({ messagingQueue: false, queueType: 'RabbitMQ' }))).toBe(false);
    });

    it('should conditionally include DLQ files', () => {
      const defaultFiles = feature.files!(mockAnswers({ dlqAndRetries: false }));
      expect(defaultFiles.some(f => f.dest === 'src/rabbitmq/rabbitmq.dlq.consumer.ts')).toBe(false);

      const dlqFiles = feature.files!(mockAnswers({ dlqAndRetries: true }));
      expect(dlqFiles.some(f => f.dest === 'src/rabbitmq/rabbitmq.dlq.consumer.ts')).toBe(true);
    });

    it('should have correct injection and dependencies', () => {
      expect(feature.dependencies).toEqual(expect.arrayContaining(['@nestjs/microservices', 'amqplib', 'amqp-connection-manager', 'rxjs']));
      expect(feature.injection).toEqual({ moduleName: 'RabbitMQModule', importPath: './rabbitmq/rabbitmq.module' });
    });
  });

  describe('Kafka', () => {
    const feature = getFeature('Kafka');
    
    it('should dynamically switch the consumer template type based on dlqAndRetries', () => {
      const dlqFiles = feature.files!(mockAnswers({ dlqAndRetries: true }));
      const consumerWithDlq = dlqFiles.find(f => f.dest === 'src/kafka/kafka.consumer.ts');
      expect(consumerWithDlq?.type).toBe('render');

      const normalFiles = feature.files!(mockAnswers({ dlqAndRetries: false }));
      const consumerNormal = normalFiles.find(f => f.dest === 'src/kafka/kafka.consumer.ts');
      expect(consumerNormal?.type).toBe('copy');
    });

    it('should have correct configuration', () => {
      expect(feature.dependencies).toEqual(expect.arrayContaining(['@nestjs/microservices', 'kafkajs', 'rxjs']));
      expect(feature.injection).toEqual({ moduleName: 'KafkaModule', importPath: './kafka/kafka.module' });
    });
  });

  describe('BullMQ', () => {
    const feature = getFeature('BullMQ');

    it('should be enabled only if messagingQueue is true and queueType is BullMQ', () => {
      expect(feature.condition(mockAnswers({ messagingQueue: true, queueType: 'BullMQ' }))).toBe(true);
    });

    it('should include DLQ cron job if dlqAndRetries is true', () => {
      const dlqFiles = feature.files!(mockAnswers({ dlqAndRetries: true }));
      expect(dlqFiles.some(f => f.dest === 'src/bullmq/bullmq.dlq.cron.ts')).toBe(true);
    });

    it('should have correct configuration', () => {
      expect(feature.dependencies).toEqual(expect.arrayContaining(['@nestjs/bullmq', 'bullmq', '@nestjs/schedule']));
      expect(feature.injection).toEqual({ moduleName: 'BullMQModule', importPath: './bullmq/bullmq.module' });
    });
  });

  describe('Redis', () => {
    const feature = getFeature('Redis');

    it('should be enabled if redisCache is true', () => {
      expect(feature.condition(mockAnswers({ redisCache: true }))).toBe(true);
    });

    it('should have correct configuration', () => {
      expect(feature.dependencies).toEqual(['@nestjs/cache-manager', 'cache-manager', 'cache-manager-redis-store']);
      expect(feature.devDependencies).toEqual(['@types/cache-manager-redis-store']);
      expect(feature.injection).toEqual({ moduleName: 'RedisModule', importPath: './redis/redis.module' });
    });
  });

  describe('Loggers', () => {
    const winston = getFeature('Winston Logger');
    const pino = getFeature('Pino Logger');
    const morgan = getFeature('Morgan');

    it('should selectively enable loggers', () => {
      expect(winston.condition(mockAnswers({ logger: 'Winston' }))).toBe(true);
      expect(winston.condition(mockAnswers({ logger: 'Pino' }))).toBe(false);
      expect(pino.condition(mockAnswers({ logger: 'Pino' }))).toBe(true);
      expect(morgan.condition(mockAnswers({ logger: 'Morgan' }))).toBe(true);
    });

    it('should have correct dependencies and injection', () => {
      expect(winston.dependencies).toEqual(['nest-winston', 'winston']);
      expect(pino.dependencies).toEqual(['nestjs-pino', 'pino-http', 'pino-pretty']);
      expect(morgan.dependencies).toEqual(['morgan']);
      expect(morgan.devDependencies).toEqual(['@types/morgan']);

      expect(winston.injection).toEqual({ moduleName: 'LoggerModule', importPath: './logger/logger.module' });
      expect(pino.injection).toEqual({ moduleName: 'LoggerModule', importPath: './logger/logger.module' });
      expect(morgan.injection).toBeUndefined(); // Morgan is applied in main.ts
    });
  });

  describe('Observability', () => {
    const otel = getFeature('OpenTelemetry');
    const prom = getFeature('Prometheus');

    it('should enable OpenTelemetry if selected', () => {
      expect(otel.condition(mockAnswers({ observability: 'OpenTelemetry' }))).toBe(true);
      expect(otel.dependencies).toContain('@opentelemetry/sdk-node@0.39.1');
      expect(otel.injection).toBeUndefined(); // Applied in main.ts
    });

    it('should enable Prometheus if selected', () => {
      expect(prom.condition(mockAnswers({ observability: 'Prometheus' }))).toBe(true);
      expect(prom.dependencies).toEqual(['@willsoto/nestjs-prometheus', 'prom-client']);
      expect(prom.injection).toEqual({ moduleName: 'MetricsModule', importPath: './observability/prometheus.module' });
    });
  });

  describe('Swagger', () => {
    const feature = getFeature('Swagger');

    it('should be enabled if apiDocs is true', () => {
      expect(feature.condition(mockAnswers({ apiDocs: true }))).toBe(true);
      expect(feature.dependencies).toEqual(['@nestjs/swagger']);
      expect(feature.injection).toBeUndefined();
    });
  });

  describe('Opossum', () => {
    const feature = getFeature('Opossum');

    it('should be enabled if opossum is true', () => {
      expect(feature.condition(mockAnswers({ opossum: true }))).toBe(true);
      expect(feature.dependencies).toEqual(['opossum']);
      expect(feature.devDependencies).toEqual(['@types/opossum']);
      expect(feature.injection).toEqual({ moduleName: 'ResiliencyModule', importPath: './resiliency/resiliency.module' });
    });
  });
});
