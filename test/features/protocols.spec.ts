import { FEATURES } from '../../src/features/index.js';
import { FeatureConfig, PromptAnswers } from '../../src/features/types.js';

const getFeature = (name: string) => {
  const f = FEATURES.find(f => f.name === name);
  if (!f) throw new Error(`Feature ${name} not found`);
  return f;
};

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

describe('Protocols', () => {
  describe('REST', () => {
    const feature = getFeature('REST');

    it('should be enabled only if protocols includes REST', () => {
      expect(feature.condition(mockAnswers({ protocols: ['REST'] }))).toBe(true);
      expect(feature.condition(mockAnswers({ protocols: ['GraphQL'] }))).toBe(false);
    });

    it('should have correct configuration', () => {
      expect(feature.dependencies).toBeUndefined();
      expect(feature.devDependencies).toBeUndefined();
      expect(feature.injection).toBeUndefined();

      const files = feature.files!(mockAnswers());
      expect(files).toHaveLength(1);
      expect(files.map(f => f.dest)).toEqual(['src/app.controller.ts']);
    });
  });

  describe('GraphQL', () => {
    const feature = getFeature('GraphQL');

    it('should be enabled only if protocols includes GraphQL', () => {
      expect(feature.condition(mockAnswers({ protocols: ['GraphQL'] }))).toBe(true);
      expect(feature.condition(mockAnswers({ protocols: ['REST'] }))).toBe(false);
    });

    it('should have correct configuration', () => {
      expect(feature.dependencies).toEqual(['@nestjs/graphql', '@nestjs/apollo', '@apollo/server', 'graphql', '@as-integrations/express5']);
      expect(resolveInjection(feature, mockAnswers())).toEqual({ moduleName: 'GraphqlModule', importPath: './graphql/graphql.module' });

      const files = feature.files!(mockAnswers());
      expect(files).toHaveLength(3);
      expect(files.map(f => f.dest)).toContain('src/graphql/graphql.module.ts');
      expect(files.map(f => f.dest)).toContain('src/graphql/app.resolver.ts');
    });
  });

  describe('gRPC', () => {
    const feature = getFeature('gRPC');

    it('should be enabled only if protocols includes gRPC', () => {
      expect(feature.condition(mockAnswers({ protocols: ['gRPC'] }))).toBe(true);
      expect(feature.condition(mockAnswers({ protocols: ['REST'] }))).toBe(false);
    });

    it('should have correct configuration', () => {
      expect(feature.dependencies).toEqual(expect.arrayContaining(['@nestjs/microservices', '@grpc/grpc-js', '@grpc/proto-loader', 'rxjs']));
      expect(resolveInjection(feature, mockAnswers())).toEqual({ moduleName: 'GrpcClientModule', importPath: './grpc/grpc.module' });

      const files = feature.files!(mockAnswers());
      expect(files.map(f => f.dest)).toContain('src/grpc/grpc.module.ts');
      expect(files.map(f => f.dest)).toContain('src/grpc/hero/hero.proto');
    });
  });

  describe('WebSockets', () => {
    const feature = getFeature('WebSockets');

    it('should be enabled only if protocols includes WebSockets', () => {
      expect(feature.condition(mockAnswers({ protocols: ['WebSockets'] }))).toBe(true);
      expect(feature.condition(mockAnswers({ protocols: ['REST'] }))).toBe(false);
    });

    it('should have correct configuration', () => {
      expect(feature.dependencies).toEqual(expect.arrayContaining(['@nestjs/platform-socket.io', '@nestjs/websockets', 'socket.io']));
      expect(resolveInjection(feature, mockAnswers())).toEqual({ moduleName: 'WebSocketsModule', importPath: './websockets/websockets.module' });

      const files = feature.files!(mockAnswers());
      expect(files.map(f => f.dest)).toContain('src/websockets/websockets.module.ts');
      expect(files.map(f => f.dest)).toContain('src/websockets/app.gateway.ts');
    });
  });
});
