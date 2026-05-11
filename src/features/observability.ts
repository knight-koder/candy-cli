import type { FeatureConfig } from './types.js';

export const openTelemetryFeature: FeatureConfig = {
  name: 'OpenTelemetry',
  condition: (a) => a.observability === 'OpenTelemetry',
  dependencies: [
    '@opentelemetry/sdk-node@0.39.1',
    '@opentelemetry/api@1.4.1',
    '@opentelemetry/auto-instrumentations-node@0.37.0',
    '@opentelemetry/exporter-trace-otlp-http@0.39.1',
    '@opentelemetry/resources@1.13.0',
    '@opentelemetry/semantic-conventions@1.13.0',
  ],
  files: () => [
    { src: 'modules/observability/tracing.ts.ejs', dest: 'src/tracing.ts', type: 'render' },
  ],
  dockerServices: {
    jaeger: {
      image: 'jaegertracing/all-in-one:latest',
      ports: ['16686:16686', '4318:4318'],
    },
  },
};

export const prometheusFeature: FeatureConfig = {
  name: 'Prometheus',
  condition: (a) => a.observability === 'Prometheus',
  dependencies: ['@willsoto/nestjs-prometheus', 'prom-client'],
  files: () => [
    { src: 'modules/observability/prometheus.module.ts.ejs', dest: 'src/observability/prometheus.module.ts', type: 'render' },
  ],
  injection: { moduleName: 'MetricsModule', importPath: './observability/prometheus.module' },
  dockerServices: {
    prometheus: {
      image: 'prom/prometheus:latest',
      ports: ['9090:9090'],
    },
  },
};

export const swaggerFeature: FeatureConfig = {
  name: 'Swagger',
  condition: (a) => a.apiDocs,
  dependencies: ['@nestjs/swagger'],
};

export const opossumFeature: FeatureConfig = {
  name: 'Opossum',
  condition: (a) => a.opossum,
  dependencies: ['opossum'],
  devDependencies: ['@types/opossum'],
  files: () => [
    { src: 'modules/resiliency/circuit-breaker.service.ts.ejs', dest: 'src/resiliency/circuit-breaker.service.ts', type: 'render' },
    { src: 'modules/resiliency/circuit-breaker.service.spec.ts.ejs', dest: 'src/resiliency/circuit-breaker.service.spec.ts', type: 'render' },
    { src: 'modules/resiliency/resiliency.module.ts.ejs', dest: 'src/resiliency/resiliency.module.ts', type: 'render' },
  ],
  injection: { moduleName: 'ResiliencyModule', importPath: './resiliency/resiliency.module' },
};
