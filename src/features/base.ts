import type { FeatureConfig } from './types.js';

export const baseFeature: FeatureConfig = {
  name: 'Base',
  condition: () => true,
  dependencies: ['@nestjs/config'],
  files: () => [
    { src: 'main.ts.ejs', dest: 'src/main.ts', type: 'render' },
    { src: 'app.module.ts.ejs', dest: 'src/app.module.ts', type: 'render' },
    { src: '.env.example.ejs', dest: '.env.example', type: 'render' },
    { src: 'Dockerfile.ejs', dest: 'Dockerfile', type: 'render' },
  ],
};

export const fastifyFeature: FeatureConfig = {
  name: 'Fastify',
  condition: (a) => a.httpAdapter === 'Fastify',
  dependencies: ['@nestjs/platform-fastify'],
};
