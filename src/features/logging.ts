import type { FeatureConfig } from './types.js';

export const winstonFeature: FeatureConfig = {
  name: 'Winston Logger',
  condition: (a) => a.logger === 'Winston',
  dependencies: ['nest-winston', 'winston'],
  files: () => [
    { src: 'modules/logger/winston.module.ts.ejs', dest: 'src/logger/logger.module.ts', type: 'render' },
  ],
  injection: { moduleName: 'LoggerModule', importPath: './logger/logger.module' },
};

export const pinoFeature: FeatureConfig = {
  name: 'Pino Logger',
  condition: (a) => a.logger === 'Pino',
  dependencies: ['nestjs-pino', 'pino-http', 'pino-pretty'],
  files: () => [
    { src: 'modules/logger/pino.module.ts.ejs', dest: 'src/logger/logger.module.ts', type: 'render' },
  ],
  injection: { moduleName: 'LoggerModule', importPath: './logger/logger.module' },
};

export const morganFeature: FeatureConfig = {
  name: 'Morgan',
  condition: (a) => a.logger === 'Morgan',
  dependencies: ['morgan'],
  devDependencies: ['@types/morgan'],
};
