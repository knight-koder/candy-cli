export const DOCKER_IMAGES = {
  POSTGRES: 'postgres:16-alpine',
  MYSQL: 'mysql:8',
  MONGODB: 'mongo:7',
  REDIS: 'redis:alpine',
  KAFKA: 'apache/kafka:latest',
  RABBITMQ: 'rabbitmq:3-management',
  JAEGER: 'jaegertracing/all-in-one:latest',
  PROMETHEUS: 'prom/prometheus:latest',
} as const;
