import type { FeatureConfig, PromptAnswers } from './types.js';
import { 
  NEST_CLI_CONFIG_FILE,
  APP_MODULE_FILE,
  PACKAGE_JSON_FILE,
  MAIN_TS_FILE,
  ENV_EXAMPLE_FILE,
  DOCKERFILE_FILE,
  ADAPTERS, 
  FEATURE_NAMES 
} from '../constants/index.js';

export const baseFeature: FeatureConfig = {
  name: FEATURE_NAMES.BASE,
  condition: () => true,
  dependencies: (a: PromptAnswers) => {
    const deps = [
      '@nestjs/config',
      '@nestjs/terminus',
      '@nestjs/axios',
      'joi',
      '@nestjs/throttler',
      'class-validator',
      'class-transformer',
      '@nestjs/microservices',
    ];

    if (a.redisCache || (a.messagingQueue && a.queueType === 'BullMQ')) {
      deps.push('@nest-lab/throttler-storage-redis', 'ioredis');
    }

    return deps;
  },
  files: () => [
    { src: 'main.ts.ejs', dest: MAIN_TS_FILE, type: 'render' },
    { src: 'app.module.ts.ejs', dest: APP_MODULE_FILE, type: 'render' },
    { src: '.env.example.ejs', dest: ENV_EXAMPLE_FILE, type: 'render' },
    { src: 'Dockerfile.ejs', dest: DOCKERFILE_FILE, type: 'render' },
    { src: 'modules/health/health.module.ts.ejs', dest: 'src/health/health.module.ts', type: 'render' },
    { src: 'modules/health/health.controller.ts.ejs', dest: 'src/health/health.controller.ts', type: 'render' },
    { src: 'modules/testing/regression.e2e-spec.ts.ejs', dest: 'test/regression.e2e-spec.ts', type: 'render' },
    { src: 'modules/testing/jest-e2e.json.ejs', dest: 'test/jest-e2e.json', type: 'render' },
    { src: 'README.md.ejs', dest: 'README.md', type: 'render' },
  ],
};

export const fastifyFeature: FeatureConfig = {
  name: FEATURE_NAMES.FASTIFY,
  condition: (a) => a.httpAdapter === ADAPTERS.FASTIFY,
  dependencies: ['@nestjs/platform-fastify'],
};
