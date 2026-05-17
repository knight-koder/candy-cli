import { 
  MESSAGING_FEATURES, 
  DATABASE_FEATURES, 
  PROTOCOL_FEATURES,
  FEATURE_NAMES,
  LOGGERS,
  OBSERVABILITY
} from '../constants/index.js';
import { 
  MessagingFeature, 
  DatabaseFeature, 
  ProtocolFeature, 
  LoggerType, 
  ObservabilityType 
} from './types.js';

/**
 * Helper to check if a feature string belongs to a category
 */
export const isMessagingFeature = (f: string): f is MessagingFeature =>
  (MESSAGING_FEATURES as readonly string[]).includes(f);

export const isDatabaseFeature = (f: string): f is DatabaseFeature =>
  (DATABASE_FEATURES as readonly string[]).includes(f);

export const isProtocolFeature = (f: string): f is ProtocolFeature =>
  (PROTOCOL_FEATURES as readonly string[]).includes(f);

/**
 * Maps a CLI feature name to its internal Answer value
 */
export const mapFeatureToLogger = (f: string): LoggerType => {
  if (f === FEATURE_NAMES.WINSTON) return LOGGERS.WINSTON;
  if (f === FEATURE_NAMES.PINO) return LOGGERS.PINO;
  return LOGGERS.NONE;
};

export const mapFeatureToObservability = (f: string): ObservabilityType => {
  if (f === FEATURE_NAMES.OPENTELEMETRY) return OBSERVABILITY.OPENTELEMETRY;
  if (f === FEATURE_NAMES.PROMETHEUS) return OBSERVABILITY.PROMETHEUS;
  return OBSERVABILITY.NONE;
};

/**
 * Converts a path relative to project root (e.g. 'src/database/postgres')
 * to a path relative to 'src/' (e.g. './database/postgres') for imports in app.module.ts.
 */
export const getRelativeImportPath = (path: string): string => {
  return `./${path.replace(/^src\//, '')}`;
};
