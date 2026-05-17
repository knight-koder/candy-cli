#!/usr/bin/env node

// src/constants/features.ts
var PROTOCOLS = {
  REST: "REST",
  GRAPHQL: "GraphQL",
  GRPC: "gRPC",
  WEBSOCKETS: "WebSockets"
};
var DATABASES = {
  POSTGRESQL: "PostgreSQL",
  MYSQL: "MySQL",
  MONGODB: "MongoDB"
};
var MESSAGING = {
  KAFKA: "Kafka",
  RABBITMQ: "RabbitMQ",
  BULLMQ: "BullMQ"
};
var ADAPTERS = {
  EXPRESS: "Express",
  FASTIFY: "Fastify"
};
var FEATURE_NAMES = {
  ...PROTOCOLS,
  ...DATABASES,
  ...MESSAGING,
  ...ADAPTERS,
  WINSTON: "Winston Logger",
  PINO: "Pino Logger",
  REDIS: "Redis",
  SWAGGER: "Swagger",
  OPENTELEMETRY: "OpenTelemetry",
  PROMETHEUS: "Prometheus",
  OPOSSUM: "Opossum",
  REST_CRUD: "REST-CRUD",
  BASE: "Base",
  MICROSERVICES_BASE: "Microservices Base"
};
var DATABASE_FEATURES = [DATABASES.POSTGRESQL, DATABASES.MYSQL, DATABASES.MONGODB];
var PROTOCOL_FEATURES = [PROTOCOLS.REST, PROTOCOLS.GRAPHQL, PROTOCOLS.GRPC, PROTOCOLS.WEBSOCKETS];
var MESSAGING_FEATURES = [MESSAGING.KAFKA, MESSAGING.RABBITMQ, MESSAGING.BULLMQ];
var LOGGERS = {
  WINSTON: "Winston",
  PINO: "Pino",
  NONE: "None"
};
var LOGGER_FEATURES = [LOGGERS.WINSTON, LOGGERS.PINO, LOGGERS.NONE];
var OBSERVABILITY = {
  OPENTELEMETRY: "OpenTelemetry",
  PROMETHEUS: "Prometheus",
  NONE: "None"
};
var OBSERVABILITY_FEATURES = [OBSERVABILITY.OPENTELEMETRY, OBSERVABILITY.PROMETHEUS, OBSERVABILITY.NONE];
var ORMS = {
  TYPEORM: "TypeORM",
  PRISMA: "Prisma"
};
var ORM_TYPES = [ORMS.TYPEORM, ORMS.PRISMA];
var HTTP_ADAPTERS = [ADAPTERS.EXPRESS, ADAPTERS.FASTIFY];
var CLI_FEATURE_LIST = Object.values(FEATURE_NAMES).filter(
  (name) => name !== FEATURE_NAMES.BASE && name !== FEATURE_NAMES.MICROSERVICES_BASE
);

// src/constants/generator.ts
var TEMPLATE_LOOKUP_DEPTH = 5;
var NEST_CLI_CONFIG_FILE = "nest-cli.json";
var APP_MODULE_FILE = "src/app.module.ts";
var APP_MODULE_CLASS = "AppModule";
var MAIN_TS_FILE = "src/main.ts";
var PACKAGE_JSON_FILE = "package.json";
var DOCKER_COMPOSE_FILE = "docker-compose.yml";
var ENV_EXAMPLE_FILE = ".env.example";
var DOCKERFILE_FILE = "Dockerfile";

// src/constants/infrastructure.ts
var DOCKER_IMAGES = {
  POSTGRES: "postgres:16-alpine",
  MYSQL: "mysql:8",
  MONGODB: "mongo:7",
  REDIS: "redis:alpine",
  KAFKA: "apache/kafka:latest",
  RABBITMQ: "rabbitmq:3-management",
  JAEGER: "jaegertracing/all-in-one:latest",
  PROMETHEUS: "prom/prometheus:latest"
};

// src/constants/paths.ts
var PATHS = {
  DATABASE: "src/database",
  MESSAGING: "src/messaging",
  KAFKA: "src/kafka",
  RABBITMQ: "src/rabbitmq",
  BULLMQ: "src/bullmq",
  GRPC: "src/grpc",
  GRAPHQL: "src/graphql",
  WEBSOCKETS: "src/websockets",
  LOGGER: "src/logger",
  OBSERVABILITY: "src/observability",
  RESILIENCY: "src/resiliency",
  REDIS: "src/redis",
  EXAMPLES: "src/examples"
};

// src/features/utils.ts
var isMessagingFeature = (f) => MESSAGING_FEATURES.includes(f);
var isDatabaseFeature = (f) => DATABASE_FEATURES.includes(f);
var isProtocolFeature = (f) => PROTOCOL_FEATURES.includes(f);
var mapFeatureToLogger = (f) => {
  if (f === FEATURE_NAMES.WINSTON) return LOGGERS.WINSTON;
  if (f === FEATURE_NAMES.PINO) return LOGGERS.PINO;
  return LOGGERS.NONE;
};
var mapFeatureToObservability = (f) => {
  if (f === FEATURE_NAMES.OPENTELEMETRY) return OBSERVABILITY.OPENTELEMETRY;
  if (f === FEATURE_NAMES.PROMETHEUS) return OBSERVABILITY.PROMETHEUS;
  return OBSERVABILITY.NONE;
};
var getRelativeImportPath = (path) => {
  return `./${path.replace(/^src\//, "")}`;
};

export {
  PROTOCOLS,
  DATABASES,
  MESSAGING,
  ADAPTERS,
  FEATURE_NAMES,
  MESSAGING_FEATURES,
  LOGGERS,
  OBSERVABILITY,
  ORMS,
  CLI_FEATURE_LIST,
  DOCKER_IMAGES,
  PATHS,
  TEMPLATE_LOOKUP_DEPTH,
  NEST_CLI_CONFIG_FILE,
  APP_MODULE_FILE,
  APP_MODULE_CLASS,
  MAIN_TS_FILE,
  PACKAGE_JSON_FILE,
  DOCKER_COMPOSE_FILE,
  ENV_EXAMPLE_FILE,
  DOCKERFILE_FILE,
  isMessagingFeature,
  isDatabaseFeature,
  isProtocolFeature,
  mapFeatureToLogger,
  mapFeatureToObservability,
  getRelativeImportPath
};
