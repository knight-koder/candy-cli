import { input, select, confirm, checkbox } from '@inquirer/prompts';
import { 
  PackageManager,
  ProtocolFeature,
  HttpAdapter,
  DatabaseFeature,
  OrmType,
  LoggerType,
  ObservabilityType,
  MessagingFeature,
  PromptAnswers
} from '../features/types.js';
import { 
  PROTOCOLS,
  DATABASES,
  ORMS,
  ADAPTERS,
  LOGGERS,
  OBSERVABILITY,
  MESSAGING_FEATURES
} from '../constants/index.js';
import { isMessagingFeature } from '../features/utils.js';

const DEFAULTS = {
  projectName: 'my-microservice',
  packageManager: 'npm' as const,
  protocols: [PROTOCOLS.REST] as ProtocolFeature[],
  httpAdapter: ADAPTERS.EXPRESS as HttpAdapter,
  database: true, // Default to true to provide a useful starting point
  databases: [DATABASES.POSTGRESQL] as DatabaseFeature[],
  postgresOrm: ORMS.TYPEORM as OrmType,
  mysqlOrm: ORMS.TYPEORM as OrmType,
  messagingQueue: true, // Now enabled by default for a complete experience
  queueType: 'Kafka' as MessagingFeature,
  redisCache: true, // Redis is highly recommended for NestJS microservices
  logger: LOGGERS.WINSTON as LoggerType,
  observability: OBSERVABILITY.PROMETHEUS as ObservabilityType,
  apiDocs: true,
  opossum: true,
  dlqAndRetries: false
};

export async function runPrompts(
  initialProjectName?: string, 
  options: { skipPrompts?: boolean; full?: boolean } = {}
): Promise<PromptAnswers> {
  if (options.skipPrompts) {
    if (options.full) {
      return {
        ...DEFAULTS,
        projectName: initialProjectName || 'candy-full-stack',
        protocols: [PROTOCOLS.REST, PROTOCOLS.GRAPHQL, PROTOCOLS.GRPC, PROTOCOLS.WEBSOCKETS],
        databases: [DATABASES.POSTGRESQL, DATABASES.MYSQL, DATABASES.MONGODB],
        messagingQueue: true,
        queueType: 'Kafka',
        dlqAndRetries: true,
      };
    }

    return {
      ...DEFAULTS,
      projectName: initialProjectName || DEFAULTS.projectName,
    };
  }
  if (initialProjectName) {
    if (!/^[a-z0-9-_]+$/i.test(initialProjectName)) {
      throw new Error('Invalid project name. Only letters, numbers, dashes, and underscores are allowed.');
    }
  }

  const projectName = initialProjectName || await input({
    message: 'What is the name of your project?',
    default: DEFAULTS.projectName,
    validate: (val) => {
      if (!val) return 'Project name cannot be empty';
      if (!/^[a-z0-9-_]+$/i.test(val)) {
        return 'Project name can only contain letters, numbers, dashes, and underscores';
      }
      return true;
    }
  });

  const packageManager = await select({
    message: 'Which package manager do you want to use? (Use arrow keys)',
    choices: [
      { value: 'npm', name: 'npm' },
      { value: 'yarn', name: 'yarn' },
      { value: 'pnpm', name: 'pnpm' }
    ],
    default: DEFAULTS.packageManager
  }) as PackageManager;

  const protocols = await checkbox({
    message: 'Select the communication protocols to support: (Space to select, Enter to confirm)',
    choices: [
      { value: PROTOCOLS.REST, name: 'REST', checked: true },
      { value: PROTOCOLS.GRAPHQL, name: 'GraphQL' },
      { value: PROTOCOLS.GRPC, name: 'gRPC' },
      { value: PROTOCOLS.WEBSOCKETS, name: 'WebSockets' }
    ],
    validate: (arr) => arr.length > 0 ? true : 'You must select at least one protocol'
  }) as ProtocolFeature[];

  let httpAdapter: HttpAdapter | undefined = undefined;
  if (protocols.includes(PROTOCOLS.REST) || protocols.includes(PROTOCOLS.GRAPHQL) || protocols.includes(PROTOCOLS.WEBSOCKETS)) {
    httpAdapter = await select({
      message: 'Which HTTP adapter do you want to use? (Use arrow keys)',
      choices: [
        { value: ADAPTERS.EXPRESS, name: 'Express (Recommended for compatibility)' },
        { value: ADAPTERS.FASTIFY, name: 'Fastify (High performance)' }
      ],
      default: DEFAULTS.httpAdapter
    }) as HttpAdapter;
  }

  // --- Database ---
  const database = await confirm({
    message: 'Do you want to include a database?',
    default: DEFAULTS.database
  });

  let databases: DatabaseFeature[] = [];
  let postgresOrm: OrmType | undefined;
  let mysqlOrm: OrmType | undefined;

  if (database) {
    databases = await checkbox({
      message: 'Select databases to include: (Space to select, Enter to confirm)',
      choices: [
        { value: DATABASES.POSTGRESQL, name: 'PostgreSQL (RDBMS)' },
        { value: DATABASES.MYSQL, name: 'MySQL      (RDBMS)' },
        { value: DATABASES.MONGODB, name: 'MongoDB    (NoSQL / Document)' },
      ],
      validate: (arr) => arr.length > 0 ? true : 'Select at least one database',
    }) as DatabaseFeature[];

    if (databases.includes(DATABASES.POSTGRESQL)) {
      postgresOrm = await select({
        message: 'Which ORM for PostgreSQL? (Use arrow keys)',
        choices: [
          { value: ORMS.TYPEORM, name: 'TypeORM (decorator-based, NestJS-native)' },
          { value: ORMS.PRISMA, name: 'Prisma  (schema-first, type-safe client)' },
        ],
        default: DEFAULTS.postgresOrm,
      }) as OrmType;
    }

    if (databases.includes(DATABASES.MYSQL)) {
      mysqlOrm = await select({
        message: 'Which ORM for MySQL? (Use arrow keys)',
        choices: [
          { value: ORMS.TYPEORM, name: 'TypeORM (decorator-based, NestJS-native)' },
          { value: ORMS.PRISMA, name: 'Prisma  (schema-first, type-safe client)' },
        ],
        default: DEFAULTS.mysqlOrm,
      }) as OrmType;
    }
  }

  // --- Messaging Queue ---
  const messagingQueue = await confirm({
    message: 'Do you want to configure an asynchronous messaging queue?',
    default: DEFAULTS.messagingQueue
  });

  let queueType: MessagingFeature | undefined = undefined;
  let dlqAndRetries = false;
  if (messagingQueue) {
    queueType = await select({
      message: 'Which messaging queue do you want to use? (Use arrow keys)',
      choices: MESSAGING_FEATURES.map(f => ({ value: f, name: f })),
      default: 'Kafka'
    }) as MessagingFeature;

    dlqAndRetries = await confirm({
      message: 'Do you want to configure Dead Letter Queue (DLQ) and Retries for your Message Queue?',
      default: true
    });
  }

  // --- Redis ---
  const redisCache = await confirm({
    message: 'Do you want to include Redis for caching?',
    default: DEFAULTS.redisCache
  });

  // --- Logger ---
  const logger = await select({
    message: 'Which logger do you want to configure?',
    choices: [
      { value: LOGGERS.WINSTON, name: 'Winston (General purpose, widely used)' },
      { value: LOGGERS.PINO, name: 'Pino (High performance, JSON-focused)' },
      { value: LOGGERS.NONE, name: 'None' }
    ],
    default: DEFAULTS.logger
  }) as LoggerType;

  // --- Observability ---
  const observability = await select({
    message: 'Which tracing & metrics solution do you want?',
    choices: [
      { value: OBSERVABILITY.OPENTELEMETRY, name: 'OpenTelemetry' },
      { value: OBSERVABILITY.PROMETHEUS, name: 'Prometheus' },
      { value: OBSERVABILITY.NONE, name: 'None' }
    ],
    default: DEFAULTS.observability
  }) as ObservabilityType;

  // --- API Docs ---
  let apiDocs = false;
  if (protocols.includes(PROTOCOLS.REST)) {
    apiDocs = await confirm({
      message: 'Do you want to generate API documentation (Swagger)?',
      default: true
    });
  }

  // --- Resiliency ---
  const opossum = await confirm({
    message: 'Do you want to include a Circuit Breaker (Opossum) for synchronous outbound HTTP/gRPC calls?',
    default: DEFAULTS.opossum
  });

  return {
    projectName,
    packageManager,
    protocols,
    httpAdapter,
    messagingQueue,
    queueType,
    redisCache,
    database,
    databases,
    postgresOrm,
    mysqlOrm,
    logger,
    observability,
    apiDocs,
    opossum,
    dlqAndRetries
  };
}

export interface AddFeatureAnswers {
  feature: string;
  dlqAndRetries: boolean;
}

export async function runAddPrompts(availableFeatures: string[]): Promise<AddFeatureAnswers> {
  const feature = await select({
    message: 'Select the feature you want to add to your microservice: (Use arrow keys)',
    choices: availableFeatures.map(f => ({ value: f, name: f }))
  });

  let dlqAndRetries = false;
  if (isMessagingFeature(feature)) {
    dlqAndRetries = await confirm({
      message: 'Configure Dead Letter Queue (DLQ) and Retries for this queue?',
      default: true
    });
  }

  return { feature, dlqAndRetries };
}
