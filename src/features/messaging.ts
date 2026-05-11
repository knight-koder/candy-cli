import type { FeatureConfig } from './types.js';

export const microservicesBaseFeature: FeatureConfig = {
  name: 'Microservices Base',
  condition: (a) => a.messagingQueue || a.protocols.includes('gRPC'),
  dependencies: ['@nestjs/microservices'],
};

export const kafkaFeature: FeatureConfig = {
  name: 'Kafka',
  condition: (a) => a.messagingQueue && a.queueType === 'Kafka',
  dependencies: ['kafkajs', '@nestjs/microservices', 'rxjs'],
  files: (a) => [
    { src: 'modules/kafka/kafka.module.ts.ejs', dest: 'src/kafka/kafka.module.ts', type: 'render' },
    {
      src: a.dlqAndRetries ? 'modules/kafka/kafka.dlq.consumer.ts.ejs' : 'modules/kafka/kafka.consumer.ts.ejs',
      dest: 'src/kafka/kafka.consumer.ts',
      type: a.dlqAndRetries ? 'render' : 'copy',
    },
    { src: 'modules/kafka/kafka.consumer.spec.ts.ejs', dest: 'src/kafka/kafka.consumer.spec.ts', type: 'render' },
    { src: 'modules/kafka/kafka.producer.service.ts.ejs', dest: 'src/kafka/kafka.producer.service.ts', type: 'render' },
    { src: 'modules/kafka/kafka.producer.service.spec.ts.ejs', dest: 'src/kafka/kafka.producer.service.spec.ts', type: 'render' },
  ],
  injection: { moduleName: 'KafkaModule', importPath: './kafka/kafka.module' },
  dockerServices: {
    zookeeper: {
      image: 'confluentinc/cp-zookeeper:latest',
      environment: { ZOOKEEPER_CLIENT_PORT: 2181, ZOOKEEPER_TICK_TIME: 2000 },
      ports: ['22181:2181'],
    },
    kafka: {
      image: 'confluentinc/cp-kafka:latest',
      depends_on: ['zookeeper'],
      ports: ['9092:9092'],
      environment: {
        KAFKA_BROKER_ID: 1,
        KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181',
        KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://localhost:9092',
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1,
      },
    },
  },
};

export const rabbitmqFeature: FeatureConfig = {
  name: 'RabbitMQ',
  condition: (a) => a.messagingQueue && a.queueType === 'RabbitMQ',
  dependencies: ['amqplib', 'amqp-connection-manager', '@nestjs/microservices', 'rxjs'],
  files: (a) => [
    { src: 'modules/rabbitmq/rabbitmq.module.ts.ejs', dest: 'src/rabbitmq/rabbitmq.module.ts', type: 'render' },
    { src: 'modules/rabbitmq/rabbitmq.consumer.ts.ejs', dest: 'src/rabbitmq/rabbitmq.consumer.ts', type: 'render' },
    { src: 'modules/rabbitmq/rabbitmq.consumer.spec.ts.ejs', dest: 'src/rabbitmq/rabbitmq.consumer.spec.ts', type: 'render' },
    { src: 'modules/rabbitmq/rabbitmq.publisher.service.ts.ejs', dest: 'src/rabbitmq/rabbitmq.publisher.service.ts', type: 'render' },
    { src: 'modules/rabbitmq/rabbitmq.publisher.service.spec.ts.ejs', dest: 'src/rabbitmq/rabbitmq.publisher.service.spec.ts', type: 'render' },
    ...(a.dlqAndRetries ? [{ src: 'modules/rabbitmq/rabbitmq.dlq.consumer.ts.ejs', dest: 'src/rabbitmq/rabbitmq.dlq.consumer.ts', type: 'render' as const }] : []),
  ],
  injection: { moduleName: 'RabbitMQModule', importPath: './rabbitmq/rabbitmq.module' },
  dockerServices: {
    rabbitmq: {
      image: 'rabbitmq:3-management',
      ports: ['5672:5672', '15672:15672'],
      environment: { RABBITMQ_DEFAULT_USER: 'guest', RABBITMQ_DEFAULT_PASS: 'guest' },
    },
  },
};

export const bullmqFeature: FeatureConfig = {
  name: 'BullMQ',
  condition: (a) => a.messagingQueue && a.queueType === 'BullMQ',
  dependencies: ['@nestjs/bullmq', 'bullmq', '@nestjs/schedule'],
  files: (a) => [
    { src: 'modules/bullmq/bullmq.module.ts.ejs', dest: 'src/bullmq/bullmq.module.ts', type: 'render' },
    { src: 'modules/bullmq/bullmq.processor.ts.ejs', dest: 'src/bullmq/bullmq.processor.ts', type: 'render' },
    { src: 'modules/bullmq/bullmq.processor.spec.ts.ejs', dest: 'src/bullmq/bullmq.processor.spec.ts', type: 'render' },
    { src: 'modules/bullmq/bullmq.producer.service.ts.ejs', dest: 'src/bullmq/bullmq.producer.service.ts', type: 'render' },
    { src: 'modules/bullmq/bullmq.producer.service.spec.ts.ejs', dest: 'src/bullmq/bullmq.producer.service.spec.ts', type: 'render' },
    ...(a.dlqAndRetries ? [
      { src: 'modules/bullmq/bullmq.dlq.cron.ts.ejs', dest: 'src/bullmq/bullmq.dlq.cron.ts', type: 'render' as const },
      { src: 'modules/bullmq/bullmq.dlq.cron.spec.ts.ejs', dest: 'src/bullmq/bullmq.dlq.cron.spec.ts', type: 'render' as const },
    ] : []),
  ],
  injection: { moduleName: 'BullMQModule', importPath: './bullmq/bullmq.module' },
  dockerServices: {
    redis: { image: 'redis:alpine', ports: ['6379:6379'] },
  },
};
