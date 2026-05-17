import { FEATURES } from '../../src/features/index.js';
import { FeatureConfig, DockerService, PromptAnswers } from '../../src/features/types.js';

const getFeature = (name: string) => {
  const f = FEATURES.find(f => f.name === name);
  if (!f) throw new Error(`Feature ${name} not found`);
  return f;
};

function resolveDependencies(feature: FeatureConfig, answers: PromptAnswers): string[] {
  if (!feature.dependencies) return [];
  return typeof feature.dependencies === 'function' ? feature.dependencies(answers) : feature.dependencies;
}

function resolveInjection(feature: FeatureConfig, answers: PromptAnswers) {
  if (!feature.injection) return null;
  return {
    moduleName: feature.injection.moduleName,
    importPath: typeof feature.injection.importPath === 'function' 
      ? feature.injection.importPath(answers) 
      : feature.injection.importPath
  };
}

const mockAnswers = (overrides: Partial<PromptAnswers> = {}): PromptAnswers => ({
  projectName: 'test-app',
  packageManager: 'npm',
  protocols: [],
  messagingQueue: false,
  queueType: undefined,
  redisCache: false,
  database: false,
  databases: [],
  logger: 'None',
  observability: 'None',
  apiDocs: false,
  opossum: false,
  dlqAndRetries: false,
  ...overrides,
});

describe('Observability & Utilities', () => {
  describe('Loggers', () => {
    const winston = getFeature('Winston Logger');
    const pino = getFeature('Pino Logger');

    it('should selectively enable loggers based on logger selection', () => {
      expect(winston.condition(mockAnswers({ logger: 'Winston' }))).toBe(true);
      expect(winston.condition(mockAnswers({ logger: 'Pino' }))).toBe(false);
      expect(pino.condition(mockAnswers({ logger: 'Pino' }))).toBe(true);
    });

    it('should have correct dependencies', () => {
      expect(resolveDependencies(winston, mockAnswers())).toEqual(['nest-winston', 'winston']);
      expect(resolveDependencies(pino, mockAnswers())).toEqual(['nestjs-pino', 'pino', 'pino-pretty']);
    });

    it('should include HTTP loggers when REST is enabled', () => {
      const restAnswers = mockAnswers({ protocols: ['REST'], logger: 'Winston' });
      expect(resolveDependencies(winston, restAnswers)).toContain('morgan');

      const pinoRestAnswers = mockAnswers({ protocols: ['REST'], logger: 'Pino' });
      expect(resolveDependencies(pino, pinoRestAnswers)).toContain('pino-http');
    });

    it('should have correct injection config', () => {
      expect(resolveInjection(winston, mockAnswers())).toEqual({ moduleName: 'LoggerModule', importPath: './logger/logger.module' });
      expect(resolveInjection(pino, mockAnswers())).toEqual({ moduleName: 'LoggerModule', importPath: './logger/logger.module' });
    });
  });

  describe('Observability', () => {
    const otel = getFeature('OpenTelemetry');
    const prom = getFeature('Prometheus');

    it('should enable OpenTelemetry if selected', () => {
      expect(otel.condition(mockAnswers({ observability: 'OpenTelemetry' }))).toBe(true);
      expect(otel.condition(mockAnswers({ observability: 'Prometheus' }))).toBe(false);
      expect(resolveDependencies(otel, mockAnswers())).toContain('@opentelemetry/sdk-node@0.39.1');
      expect(otel.injection).toBeUndefined(); // Applied in main.ts, not as a NestJS module
    });

    it('should enable Prometheus if selected', () => {
      expect(prom.condition(mockAnswers({ observability: 'Prometheus' }))).toBe(true);
      expect(prom.condition(mockAnswers({ observability: 'OpenTelemetry' }))).toBe(false);
      expect(resolveDependencies(prom, mockAnswers())).toEqual(['@willsoto/nestjs-prometheus', 'prom-client']);
      expect(resolveInjection(prom, mockAnswers())).toEqual({ moduleName: 'MetricsModule', importPath: './observability/prometheus.module' });
    });
  });

  describe('Swagger', () => {
    const feature = getFeature('Swagger');

    it('should be enabled if apiDocs is true', () => {
      expect(feature.condition(mockAnswers({ apiDocs: true }))).toBe(true);
      expect(feature.condition(mockAnswers({ apiDocs: false }))).toBe(false);
    });

    it('should have correct configuration', () => {
      expect(feature.dependencies).toEqual(['@nestjs/swagger']);
      expect(feature.injection).toBeUndefined(); // Applied in main.ts via SwaggerModule.setup()
    });
  });

  describe('Opossum (Circuit Breaker)', () => {
    const feature = getFeature('Opossum');

    it('should be enabled if opossum is true', () => {
      expect(feature.condition(mockAnswers({ opossum: true }))).toBe(true);
      expect(feature.condition(mockAnswers({ opossum: false }))).toBe(false);
    });

    it('should have correct configuration', () => {
      expect(resolveDependencies(feature, mockAnswers())).toEqual(['opossum']);
      expect(feature.devDependencies).toEqual(['@types/opossum']);
      expect(resolveInjection(feature, mockAnswers())).toEqual({ moduleName: 'ResiliencyModule', importPath: './resiliency/resiliency.module' });
    });
  });
});
