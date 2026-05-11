import type { FeatureConfig } from './types.js';

export const redisFeature: FeatureConfig = {
  name: 'Redis',
  condition: (a) => a.redisCache,
  dependencies: ['@nestjs/cache-manager', 'cache-manager', 'cache-manager-redis-store'],
  devDependencies: ['@types/cache-manager-redis-store'],
  files: () => [
    { src: 'modules/redis/redis.module.ts.ejs', dest: 'src/redis/redis.module.ts', type: 'render' },
    { src: 'modules/redis/redis.service.ts.ejs', dest: 'src/redis/redis.service.ts', type: 'render' },
    { src: 'modules/redis/redis.service.spec.ts.ejs', dest: 'src/redis/redis.service.spec.ts', type: 'render' },
  ],
  injection: { moduleName: 'RedisModule', importPath: './redis/redis.module' },
  dockerServices: {
    redis: { image: 'redis:alpine', ports: ['6379:6379'] },
  },
};
