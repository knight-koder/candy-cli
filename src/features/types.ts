import {
  PROTOCOL_FEATURES,
  DATABASE_FEATURES,
  MESSAGING_FEATURES,
  LOGGER_FEATURES,
  OBSERVABILITY_FEATURES,
  ORM_TYPES,
  HTTP_ADAPTERS,
  PACKAGE_MANAGERS
} from '../constants/index.js';

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];
export type ProtocolFeature = (typeof PROTOCOL_FEATURES)[number];
export type DatabaseFeature = (typeof DATABASE_FEATURES)[number];
export type MessagingFeature = (typeof MESSAGING_FEATURES)[number];
export type LoggerType = (typeof LOGGER_FEATURES)[number];
export type ObservabilityType = (typeof OBSERVABILITY_FEATURES)[number];
export type OrmType = (typeof ORM_TYPES)[number];
export type HttpAdapter = (typeof HTTP_ADAPTERS)[number];

export interface PromptAnswers {
  projectName: string;
  packageManager: PackageManager;
  // Protocols & Messaging
  protocols: ProtocolFeature[];
  httpAdapter?: HttpAdapter;
  messagingQueue: boolean;
  queueType?: MessagingFeature;
  dlqAndRetries: boolean;
  redisCache: boolean;
  // Database
  database: boolean;
  databases?: DatabaseFeature[];
  postgresOrm?: OrmType;
  mysqlOrm?: OrmType;
  // Observability / logging
  logger: LoggerType;
  observability: ObservabilityType;
  apiDocs: boolean;
  opossum: boolean;
  skipInstall?: boolean;
  rateLimiting?: boolean;
}

export interface FileInjection {
  src: string;
  dest: string;
  type: 'copy' | 'render';
}

export interface DockerService {
  image?: string;
  ports?: string[];
  environment?: Record<string, string | number | boolean | undefined>;
  volumes?: string[];
  networks?: string[];
  depends_on?: string[] | Record<string, { condition: 'service_started' | 'service_healthy' | 'service_completed_successfully' | string }>;
  healthcheck?: {
    test: string[];
    interval?: string;
    timeout?: string;
    retries?: number;
    start_period?: string;
  };
  build?: string | { context: string; dockerfile?: string };
  command?: string | string[];
  restart?: string;
  [key: string]: unknown;
}

export interface FeatureConfig {
  name: string;
  condition: (answers: PromptAnswers) => boolean;
  dependencies?: string[] | ((answers: PromptAnswers) => string[]);
  devDependencies?: string[] | ((answers: PromptAnswers) => string[]);
  files?: (answers: PromptAnswers) => FileInjection[];
  injection?: {
    moduleName: string;
    importPath: string | ((answers: PromptAnswers) => string);
  };
  dockerServices?: Record<string, DockerService> | ((answers: PromptAnswers) => Record<string, DockerService>);
}
