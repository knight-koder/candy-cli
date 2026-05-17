export const PROTOCOLS = {
  REST: 'REST',
  GRAPHQL: 'GraphQL',
  GRPC: 'gRPC',
  WEBSOCKETS: 'WebSockets',
} as const;

export const DATABASES = {
  POSTGRESQL: 'PostgreSQL',
  MYSQL: 'MySQL',
  MONGODB: 'MongoDB',
} as const;

export const MESSAGING = {
  KAFKA: 'Kafka',
  RABBITMQ: 'RabbitMQ',
  BULLMQ: 'BullMQ',
} as const;

export const ADAPTERS = {
  EXPRESS: 'Express',
  FASTIFY: 'Fastify',
} as const;

export const FEATURE_NAMES = {
  ...PROTOCOLS,
  ...DATABASES,
  ...MESSAGING,
  ...ADAPTERS,
  WINSTON: 'Winston Logger',
  PINO: 'Pino Logger',
  REDIS: 'Redis',
  SWAGGER: 'Swagger',
  OPENTELEMETRY: 'OpenTelemetry',
  PROMETHEUS: 'Prometheus',
  OPOSSUM: 'Opossum',
  REST_CRUD: 'REST-CRUD',
  BASE: 'Base',
  MICROSERVICES_BASE: 'Microservices Base',
} as const;

export const DATABASE_FEATURES = [DATABASES.POSTGRESQL, DATABASES.MYSQL, DATABASES.MONGODB] as const;
export const PROTOCOL_FEATURES = [PROTOCOLS.REST, PROTOCOLS.GRAPHQL, PROTOCOLS.GRPC, PROTOCOLS.WEBSOCKETS] as const;
export const MESSAGING_FEATURES = [MESSAGING.KAFKA, MESSAGING.RABBITMQ, MESSAGING.BULLMQ] as const;

export const LOGGERS = {
  WINSTON: 'Winston',
  PINO: 'Pino',
  NONE: 'None',
} as const;

export const LOGGER_FEATURES = [LOGGERS.WINSTON, LOGGERS.PINO, LOGGERS.NONE] as const;

export const OBSERVABILITY = {
  OPENTELEMETRY: 'OpenTelemetry',
  PROMETHEUS: 'Prometheus',
  NONE: 'None',
} as const;

export const OBSERVABILITY_FEATURES = [OBSERVABILITY.OPENTELEMETRY, OBSERVABILITY.PROMETHEUS, OBSERVABILITY.NONE] as const;

export const ORMS = {
  TYPEORM: 'TypeORM',
  PRISMA: 'Prisma',
} as const;

export const ORM_TYPES = [ORMS.TYPEORM, ORMS.PRISMA] as const;
export const HTTP_ADAPTERS = [ADAPTERS.EXPRESS, ADAPTERS.FASTIFY] as const;

export const PACKAGE_MANAGERS = ['npm', 'yarn', 'pnpm'] as const;

/** Pre-formatted list of feature names for CLI help text. */
export const CLI_FEATURE_LIST = Object.values(FEATURE_NAMES).filter(
  name => name !== FEATURE_NAMES.BASE && name !== FEATURE_NAMES.MICROSERVICES_BASE
);
