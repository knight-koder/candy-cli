export type { FileInjection, FeatureConfig } from './types.js';

import { baseFeature, fastifyFeature } from './base.js';
import { restFeature, graphqlFeature, grpcFeature, websocketsFeature } from './protocols.js';
import { microservicesBaseFeature, kafkaFeature, rabbitmqFeature, bullmqFeature } from './messaging.js';
import { redisFeature } from './redis.js';
import { winstonFeature, pinoFeature, morganFeature } from './logging.js';
import { openTelemetryFeature, prometheusFeature, swaggerFeature, opossumFeature } from './observability.js';
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
  winstonFeature,
  pinoFeature,
  morganFeature,
  openTelemetryFeature,
  prometheusFeature,
  swaggerFeature,
  opossumFeature,
];
