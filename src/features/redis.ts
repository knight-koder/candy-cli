import type { FeatureConfig } from './types.js';
import { PATHS, FEATURE_NAMES } from '../constants/index.js';
import { getRedisService } from './infrastructure.js';
import { getRelativeImportPath } from './utils.js';

export const redisFeature: FeatureConfig = {
  name: FEATURE_NAMES.REDIS,
  condition: (a) => a.redisCache,
  dependencies: ['@nestjs/cache-manager', 'cache-manager', 'cache-manager-redis-store'],
  devDependencies: ['@types/cache-manager-redis-store'],
  files: () => [
    { src: 'modules/redis/redis.module.ts.ejs', dest: `${PATHS.REDIS}/redis.module.ts`, type: 'render' },
    { src: 'modules/redis/redis.service.ts.ejs', dest: `${PATHS.REDIS}/redis.service.ts`, type: 'render' },
    { src: 'modules/redis/redis.service.spec.ts.ejs', dest: `${PATHS.REDIS}/redis.service.spec.ts`, type: 'render' },
  ],
  injection: { 
    moduleName: 'RedisModule', 
    importPath: () => `${getRelativeImportPath(PATHS.REDIS)}/redis.module` 
  },
  dockerServices: {
    redis: getRedisService(),
  },
};
