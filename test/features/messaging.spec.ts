import { FEATURES } from '../../src/features/index.js';
import { FeatureConfig, DockerService, PromptAnswers } from '../../src/features/types.js';
import { DOCKER_IMAGES, PATHS } from '../../src/constants/index.js';

const getFeature = (name: string) => {
  const f = FEATURES.find(f => f.name === name);
  if (!f) throw new Error(`Feature ${name} not found`);
  return f;
};

function resolveDependencies(feature: FeatureConfig, answers: PromptAnswers): string[] {
  if (!feature.dependencies) return [];
  return typeof feature.dependencies === 'function' ? feature.dependencies(answers) : feature.dependencies;
}

function resolveDockerServices(feature: FeatureConfig, answers: PromptAnswers): Record<string, DockerService> {
  if (!feature.dockerServices) return {};
  return typeof feature.dockerServices === 'function' ? feature.dockerServices(answers) : feature.dockerServices;
}

function resolveInjection(feature: FeatureConfig, answers: PromptAnswers) {
  if (!feature.injection) return null;
  return {
    moduleName: feature.injection.moduleName,
    importPath: typeof feature.injection.importPath === 'function' 
      ? feature.injection.importPath(answers) 
      : feature.injection.importPath
  };
}

const mockAnswers = (overrides: Partial<PromptAnswers> = {}): PromptAnswers => ({
  projectName: 'test-app',
  packageManager: 'npm',
  protocols: [],
  messagingQueue: false,
  queueType: undefined,
  redisCache: false,
  database: false,
  databases: [],
  logger: 'None',
  observability: 'None',
  apiDocs: false,
  opossum: false,
  dlqAndRetries: false,
  ...overrides,
});

describe('Messaging', () => {
  describe('RabbitMQ', () => {
    const feature = getFeature('RabbitMQ');

    it('should be enabled only if messagingQueue is true and queueType is RabbitMQ', () => {
      expect(feature.condition(mockAnswers({ messagingQueue: true, queueType: 'RabbitMQ' }))).toBe(true);
      expect(feature.condition(mockAnswers({ messagingQueue: true, queueType: 'Kafka' }))).toBe(false);
      expect(feature.condition(mockAnswers({ messagingQueue: false, queueType: 'RabbitMQ' }))).toBe(false);
    });

    it('should conditionally include DLQ files', () => {
      const defaultFiles = feature.files!(mockAnswers({ dlqAndRetries: false }));
      expect(defaultFiles.some(f => f.dest === `${PATHS.RABBITMQ}/rabbitmq.dlq.consumer.ts`)).toBe(false);

      const dlqFiles = feature.files!(mockAnswers({ dlqAndRetries: true }));
      expect(dlqFiles.some(f => f.dest === `${PATHS.RABBITMQ}/rabbitmq.dlq.consumer.ts`)).toBe(true);
    });

    it('should have correct injection and dependencies', () => {
      expect(resolveDependencies(feature, mockAnswers())).toEqual(expect.arrayContaining(['@nestjs/microservices', 'amqplib', 'amqp-connection-manager', 'rxjs']));
      expect(resolveInjection(feature, mockAnswers())).toEqual({ moduleName: 'RabbitMQModule', importPath: './rabbitmq/rabbitmq.module' });
    });

    it('should have correct docker image', () => {
      const services = resolveDockerServices(feature, mockAnswers());
      expect(services.rabbitmq.image).toBe(DOCKER_IMAGES.RABBITMQ);
    });
  });

  describe('Kafka', () => {
    const feature = getFeature('Kafka');

    it('should dynamically switch the consumer template type based on dlqAndRetries', () => {
      const dlqFiles = feature.files!(mockAnswers({ dlqAndRetries: true }));
      const consumerWithDlq = dlqFiles.find(f => f.dest === `${PATHS.KAFKA}/kafka.consumer.ts`);
      expect(consumerWithDlq?.type).toBe('render');

      const normalFiles = feature.files!(mockAnswers({ dlqAndRetries: false }));
      const consumerNormal = normalFiles.find(f => f.dest === `${PATHS.KAFKA}/kafka.consumer.ts`);
      expect(consumerNormal?.type).toBe('copy');
    });

    it('should have correct configuration', () => {
      expect(resolveDependencies(feature, mockAnswers())).toEqual(expect.arrayContaining(['@nestjs/microservices', 'kafkajs', 'rxjs']));
      expect(resolveInjection(feature, mockAnswers())).toEqual({ moduleName: 'KafkaModule', importPath: './kafka/kafka.module' });
    });

    it('should have correct docker image', () => {
      const services = resolveDockerServices(feature, mockAnswers());
      expect(services.kafka.image).toBe(DOCKER_IMAGES.KAFKA);
    });

  });

  describe('BullMQ', () => {
    const feature = getFeature('BullMQ');

    it('should be enabled only if messagingQueue is true and queueType is BullMQ', () => {
      expect(feature.condition(mockAnswers({ messagingQueue: true, queueType: 'BullMQ' }))).toBe(true);
    });

    it('should include DLQ cron job if dlqAndRetries is true', () => {
      const dlqFiles = feature.files!(mockAnswers({ dlqAndRetries: true }));
      expect(dlqFiles.some(f => f.dest === `${PATHS.BULLMQ}/bullmq.dlq.cron.ts`)).toBe(true);
    });

    it('should have correct configuration', () => {
      expect(resolveDependencies(feature, mockAnswers())).toEqual(expect.arrayContaining(['@nestjs/bullmq', 'bullmq', '@nestjs/schedule']));
      expect(resolveInjection(feature, mockAnswers())).toEqual({ moduleName: 'BullMQModule', importPath: './bullmq/bullmq.module' });
    });

    it('should have correct redis docker image', () => {
      const services = resolveDockerServices(feature, mockAnswers());
      expect(services.redis.image).toBe(DOCKER_IMAGES.REDIS);
    });
  });
});
