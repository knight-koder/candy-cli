import { FEATURES } from '../../src/features/index.js';
import { FeatureConfig, DockerService, PromptAnswers } from '../../src/features/types.js';

const getFeature = (name: string) => {
  const f = FEATURES.find(f => f.name === name);
  if (!f) throw new Error(`Feature ${name} not found`);
  return f;
};

function resolveDockerServices(feature: FeatureConfig, answers: PromptAnswers): Record<string, DockerService> {
  if (!feature.dockerServices) return {};
  return typeof feature.dockerServices === 'function' ? feature.dockerServices(answers) : feature.dockerServices;
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

describe('Redis', () => {
  const feature = getFeature('Redis');

  it('should be enabled if redisCache is true', () => {
    expect(feature.condition(mockAnswers({ redisCache: true }))).toBe(true);
    expect(feature.condition(mockAnswers({ redisCache: false }))).toBe(false);
  });

  it('should have correct dependencies and injection', () => {
    expect(feature.dependencies).toEqual(['@nestjs/cache-manager', 'cache-manager', 'cache-manager-redis-store']);
    expect(feature.devDependencies).toEqual(['@types/cache-manager-redis-store']);
    expect(resolveInjection(feature, mockAnswers())).toEqual({ moduleName: 'RedisModule', importPath: './redis/redis.module' });
  });

  it('should generate the correct files', () => {
    const files = feature.files!(mockAnswers());
    expect(files.map(f => f.dest)).toContain('src/redis/redis.module.ts');
    expect(files.map(f => f.dest)).toContain('src/redis/redis.service.ts');
  });

  it('dockerServices should return a redis service', () => {
    const services = resolveDockerServices(feature, mockAnswers());
    expect(services).toHaveProperty('redis');
    expect(services.redis.image).toBe('redis:alpine');
    expect(services.redis.ports).toContain('6379:6379');
  });
});
