/** The names of all available features, used for CLI help text. */
export const FEATURE_NAMES = [
  'REST', 'GraphQL', 'gRPC', 'WebSockets',
  'Kafka', 'RabbitMQ', 'BullMQ', 'Redis',
  'Winston Logger', 'Pino Logger', 'Morgan',
  'OpenTelemetry', 'Prometheus',
  'Swagger', 'Opossum', 'Fastify',
] as const;

/** Pre-formatted feature list for --help text. */
export const FEATURE_HELP = FEATURE_NAMES.map(f => `\n  - ${f}`).join('');
