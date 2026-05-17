import type { FeatureConfig, PromptAnswers } from './types.js';
import { PATHS, MESSAGING, PROTOCOLS, FEATURE_NAMES } from '../constants/index.js';
import { getKafkaService, getRabbitMQService, getRedisService } from './infrastructure.js';
import { getRelativeImportPath } from './utils.js';

export const microservicesBaseFeature: FeatureConfig = {
  name: FEATURE_NAMES.MICROSERVICES_BASE,
  condition: (a) => a.messagingQueue || a.protocols.includes(PROTOCOLS.GRPC),
  dependencies: ['@nestjs/microservices'],
};

export const kafkaFeature: FeatureConfig = {
  name: FEATURE_NAMES.KAFKA,
  condition: (a) => a.messagingQueue && a.queueType === MESSAGING.KAFKA,
  dependencies: ['kafkajs', '@nestjs/microservices', 'rxjs'],
  files: (a) => [
    { src: 'modules/kafka/kafka.module.ts.ejs', dest: `${PATHS.KAFKA}/kafka.module.ts`, type: 'render' },
    {
      src: a.dlqAndRetries ? 'modules/kafka/kafka.dlq.consumer.ts.ejs' : 'modules/kafka/kafka.consumer.ts.ejs',
      dest: `${PATHS.KAFKA}/kafka.consumer.ts`,
      type: a.dlqAndRetries ? 'render' : 'copy',
    },
    { src: 'modules/kafka/kafka.consumer.spec.ts.ejs', dest: `${PATHS.KAFKA}/kafka.consumer.spec.ts`, type: 'render' },
    { src: 'modules/kafka/kafka.producer.service.ts.ejs', dest: `${PATHS.KAFKA}/kafka.producer.service.ts`, type: 'render' },
    { src: 'modules/kafka/kafka.producer.service.spec.ts.ejs', dest: `${PATHS.KAFKA}/kafka.producer.service.spec.ts`, type: 'render' },
  ],
  injection: {
    moduleName: 'KafkaModule',
    importPath: () => `${getRelativeImportPath(PATHS.KAFKA)}/kafka.module`
  },
  dockerServices: (a) => ({
    kafka: getKafkaService(a),
  }),
};

export const rabbitmqFeature: FeatureConfig = {
  name: FEATURE_NAMES.RABBITMQ,
  condition: (a) => a.messagingQueue && a.queueType === MESSAGING.RABBITMQ,
  dependencies: ['amqplib', 'amqp-connection-manager', '@nestjs/microservices', 'rxjs'],
  files: (a) => [
    { src: 'modules/rabbitmq/rabbitmq.module.ts.ejs', dest: `${PATHS.RABBITMQ}/rabbitmq.module.ts`, type: 'render' },
    { src: 'modules/rabbitmq/rabbitmq.consumer.ts.ejs', dest: `${PATHS.RABBITMQ}/rabbitmq.consumer.ts`, type: 'render' },
    { src: 'modules/rabbitmq/rabbitmq.consumer.spec.ts.ejs', dest: `${PATHS.RABBITMQ}/rabbitmq.consumer.spec.ts`, type: 'render' },
    { src: 'modules/rabbitmq/rabbitmq.publisher.service.ts.ejs', dest: `${PATHS.RABBITMQ}/rabbitmq.publisher.service.ts`, type: 'render' },
    { src: 'modules/rabbitmq/rabbitmq.publisher.service.spec.ts.ejs', dest: `${PATHS.RABBITMQ}/rabbitmq.publisher.service.spec.ts`, type: 'render' },
    ...(a.dlqAndRetries ? [{ src: 'modules/rabbitmq/rabbitmq.dlq.consumer.ts.ejs', dest: `${PATHS.RABBITMQ}/rabbitmq.dlq.consumer.ts`, type: 'render' as const }] : []),
  ],
  injection: {
    moduleName: 'RabbitMQModule',
    importPath: () => `${getRelativeImportPath(PATHS.RABBITMQ)}/rabbitmq.module`
  },
  dockerServices: () => ({ rabbitmq: getRabbitMQService() }),
};

export const bullmqFeature: FeatureConfig = {
  name: FEATURE_NAMES.BULLMQ,
  condition: (a) => a.messagingQueue && a.queueType === MESSAGING.BULLMQ,
  dependencies: ['@nestjs/bullmq', 'bullmq', '@nestjs/schedule'],
  files: (a) => [
    { src: 'modules/bullmq/bullmq.module.ts.ejs', dest: `${PATHS.BULLMQ}/bullmq.module.ts`, type: 'render' },
    { src: 'modules/bullmq/bullmq.processor.ts.ejs', dest: `${PATHS.BULLMQ}/bullmq.processor.ts`, type: 'render' },
    { src: 'modules/bullmq/bullmq.processor.spec.ts.ejs', dest: `${PATHS.BULLMQ}/bullmq.processor.spec.ts`, type: 'render' },
    { src: 'modules/bullmq/bullmq.producer.service.ts.ejs', dest: `${PATHS.BULLMQ}/bullmq.producer.service.ts`, type: 'render' },
    { src: 'modules/bullmq/bullmq.producer.service.spec.ts.ejs', dest: `${PATHS.BULLMQ}/bullmq.producer.service.spec.ts`, type: 'render' },
    ...(a.dlqAndRetries ? [
      { src: 'modules/bullmq/bullmq.dlq.cron.ts.ejs', dest: `${PATHS.BULLMQ}/bullmq.dlq.cron.ts`, type: 'render' as const },
      { src: 'modules/bullmq/bullmq.dlq.cron.spec.ts.ejs', dest: `${PATHS.BULLMQ}/bullmq.dlq.cron.spec.ts`, type: 'render' as const },
    ] : []),
  ],
  injection: {
    moduleName: 'BullMQModule',
    importPath: () => `${getRelativeImportPath(PATHS.BULLMQ)}/bullmq.module`
  },
  dockerServices: () => ({ redis: getRedisService() }),
};
