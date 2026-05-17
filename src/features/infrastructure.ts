import { DOCKER_IMAGES } from '../constants/index.js';
import { DockerService, PromptAnswers } from './types.js';

/**
 * Factory for PostgreSQL Docker service
 */
export const getPostgresService = (): DockerService => ({
  image: DOCKER_IMAGES.POSTGRES,
  ports: ['5432:5432'],
  environment: {
    POSTGRES_USER: '${POSTGRES_USER:-postgres}',
    POSTGRES_PASSWORD: '${POSTGRES_PASSWORD:-postgres}',
    POSTGRES_DB: '${POSTGRES_DB}',
  },
  volumes: ['postgres_data:/var/lib/postgresql/data'],
});

/**
 * Factory for MySQL Docker service
 */
export const getMysqlService = (): DockerService => ({
  image: DOCKER_IMAGES.MYSQL,
  ports: ['3306:3306'],
  environment: {
    MYSQL_ROOT_PASSWORD: '${MYSQL_ROOT_PASSWORD:-root}',
    MYSQL_USER: '${MYSQL_USER:-app}',
    MYSQL_PASSWORD: '${MYSQL_PASSWORD:-app}',
    MYSQL_DATABASE: '${MYSQL_DB}',
  },
  volumes: ['mysql_data:/var/lib/mysql'],
});

/**
 * Factory for MongoDB Docker service
 */
export const getMongoService = (a: PromptAnswers): DockerService => ({
  image: DOCKER_IMAGES.MONGODB,
  ports: ['27017:27017'],
  environment: {
    MONGO_INITDB_DATABASE: `\${MONGO_DB:-${a.projectName}}`,
  },
  volumes: ['mongo_data:/data/db'],
});

/**
 * Factory for Redis Docker service
 */
export const getRedisService = (): DockerService => ({
  image: DOCKER_IMAGES.REDIS,
  ports: ['6379:6379'],
});

/**
 * Factory for Kafka Docker service
 */
export const getKafkaService = (a?: PromptAnswers): DockerService => {
  const service: DockerService = {
    image: DOCKER_IMAGES.KAFKA,
    ports: ['9092:9092'],
    environment: {
      KAFKA_NODE_ID: 1,
      KAFKA_PROCESS_ROLES: 'broker,controller',
      KAFKA_LISTENERS: 'PLAINTEXT://0.0.0.0:9092,INTERNAL://0.0.0.0:29092,CONTROLLER://0.0.0.0:9093',
      KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://localhost:9092,INTERNAL://kafka:29092',
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER',
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,INTERNAL:PLAINTEXT',
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka:9093',
      KAFKA_INTER_BROKER_LISTENER_NAME: 'INTERNAL',
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1,
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1,
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1,
    },
    healthcheck: {
      test: [
        'CMD-SHELL',
        '/opt/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092',
      ],
      interval: '10s',
      timeout: '5s',
      retries: 10,
      start_period: '15s',
    },
  };

  return service;
};

/**
 * Factory for RabbitMQ Docker service
 */
export const getRabbitMQService = (): DockerService => ({
  image: DOCKER_IMAGES.RABBITMQ,
  ports: ['5672:5672', '15672:15672'],
  environment: {
    RABBITMQ_DEFAULT_USER: 'guest',
    RABBITMQ_DEFAULT_PASS: 'guest'
  },
});

/**
 * Factory for Jaeger Docker service
 */
export const getJaegerService = (): DockerService => ({
  image: DOCKER_IMAGES.JAEGER,
  ports: ['16686:16686', '4318:4318'],
});

/**
 * Factory for Prometheus Docker service
 */
export const getPrometheusService = (): DockerService => ({
  image: DOCKER_IMAGES.PROMETHEUS,
  ports: ['9090:9090'],
});
