export type { FileInjection, FeatureConfig } from './types.js';

import { baseFeature, fastifyFeature } from './base.js';
import { restFeature, graphqlFeature, grpcFeature, websocketsFeature } from './protocols.js';
import { microservicesBaseFeature, kafkaFeature, rabbitmqFeature, bullmqFeature } from './messaging.js';
import { redisFeature } from './redis.js';
import { winstonFeature, pinoFeature } from './logging.js';
import { openTelemetryFeature, prometheusFeature, swaggerFeature, opossumFeature } from './observability.js';
import { postgresTypeOrmFeature, postgresPrismaFeature, mysqlTypeOrmFeature, mysqlPrismaFeature, mongooseFeature } from './database.js';
import { restCrudFeature } from './rest-crud.js';
import type { FeatureConfig } from './types.js';

export const FEATURES: FeatureConfig[] = [
  baseFeature,
  fastifyFeature,
  restFeature,
  graphqlFeature,
  grpcFeature,
  websocketsFeature,
  microservicesBaseFeature,
  kafkaFeature,
  rabbitmqFeature,
  bullmqFeature,
  redisFeature,
  // Database
  postgresTypeOrmFeature,
  postgresPrismaFeature,
  mysqlTypeOrmFeature,
  mysqlPrismaFeature,
  mongooseFeature,
  // Logging / observability
  winstonFeature,
  pinoFeature,
  openTelemetryFeature,
  prometheusFeature,
  swaggerFeature,
  opossumFeature,
  restCrudFeature,
];
