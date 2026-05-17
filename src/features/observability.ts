import type { FeatureConfig } from './types.js';
import { PATHS, LOGGERS, OBSERVABILITY, FEATURE_NAMES } from '../constants/index.js';
import { getJaegerService, getPrometheusService } from './infrastructure.js';
import { getRelativeImportPath } from './utils.js';

export const openTelemetryFeature: FeatureConfig = {
  name: FEATURE_NAMES.OPENTELEMETRY,
  condition: (a) => a.observability === OBSERVABILITY.OPENTELEMETRY,
  dependencies: (a) => {
    const deps = [
      '@opentelemetry/sdk-node@0.39.1',
      '@opentelemetry/api@1.4.1',
      '@opentelemetry/auto-instrumentations-node@0.37.0',
      '@opentelemetry/exporter-trace-otlp-http@0.39.1',
      '@opentelemetry/resources@1.13.0',
      '@opentelemetry/semantic-conventions@1.13.0',
    ];
    if (a.logger === LOGGERS.WINSTON) deps.push('@opentelemetry/instrumentation-winston');
    if (a.logger === LOGGERS.PINO) deps.push('@opentelemetry/instrumentation-pino');
    return deps;
  },
  files: () => [
    { src: 'modules/observability/tracing.ts.ejs', dest: 'src/tracing.ts', type: 'render' },
  ],
  dockerServices: {
    jaeger: getJaegerService(),
  },
};

export const prometheusFeature: FeatureConfig = {
  name: FEATURE_NAMES.PROMETHEUS,
  condition: (a) => a.observability === OBSERVABILITY.PROMETHEUS,
  dependencies: ['@willsoto/nestjs-prometheus', 'prom-client'],
  files: () => [
    { src: 'modules/observability/prometheus.module.ts.ejs', dest: `${PATHS.OBSERVABILITY}/prometheus.module.ts`, type: 'render' },
  ],
  injection: { 
    moduleName: 'MetricsModule', 
    importPath: () => `${getRelativeImportPath(PATHS.OBSERVABILITY)}/prometheus.module` 
  },
  dockerServices: () => ({ prometheus: getPrometheusService() }),
};

export const swaggerFeature: FeatureConfig = {
  name: FEATURE_NAMES.SWAGGER,
  condition: (a) => a.apiDocs,
  dependencies: ['@nestjs/swagger'],
};

export const opossumFeature: FeatureConfig = {
  name: FEATURE_NAMES.OPOSSUM,
  condition: (a) => a.opossum,
  dependencies: ['opossum'],
  devDependencies: ['@types/opossum'],
  files: () => [
    { src: 'modules/resiliency/circuit-breaker.service.ts.ejs', dest: `${PATHS.RESILIENCY}/circuit-breaker.service.ts`, type: 'render' },
    { src: 'modules/resiliency/circuit-breaker.service.spec.ts.ejs', dest: `${PATHS.RESILIENCY}/circuit-breaker.service.spec.ts`, type: 'render' },
    { src: 'modules/resiliency/resiliency.module.ts.ejs', dest: `${PATHS.RESILIENCY}/resiliency.module.ts`, type: 'render' },
  ],
  injection: { 
    moduleName: 'ResiliencyModule', 
    importPath: () => `${getRelativeImportPath(PATHS.RESILIENCY)}/resiliency.module` 
  },
};
