import type { FeatureConfig } from './types.js';
import { LOGGERS, PROTOCOLS, PATHS, FEATURE_NAMES } from '../constants/index.js';
import { getRelativeImportPath } from './utils.js';

export const winstonFeature: FeatureConfig = {
  name: FEATURE_NAMES.WINSTON,
  condition: (a) => a.logger === LOGGERS.WINSTON,
  dependencies: (a) => {
    const deps = ['nest-winston', 'winston'];
    if (a.protocols.includes(PROTOCOLS.REST)) {
      deps.push('morgan');
    }
    return deps;
  },
  devDependencies: (a) => {
    return a.protocols.includes(PROTOCOLS.REST) ? ['@types/morgan'] : [];
  },
  files: () => [
    { src: 'modules/logger/winston.module.ts.ejs', dest: `${PATHS.LOGGER}/logger.module.ts`, type: 'render' },
  ],
  injection: { 
    moduleName: 'LoggerModule', 
    importPath: () => `${getRelativeImportPath(PATHS.LOGGER)}/logger.module` 
  },
};

export const pinoFeature: FeatureConfig = {
  name: FEATURE_NAMES.PINO,
  condition: (a) => a.logger === LOGGERS.PINO,
  dependencies: (a) => {
    const deps = ['nestjs-pino', 'pino', 'pino-pretty'];
    if (a.protocols.includes(PROTOCOLS.REST)) {
      deps.push('pino-http');
    }
    return deps;
  },
  files: () => [
    { src: 'modules/logger/pino.module.ts.ejs', dest: `${PATHS.LOGGER}/logger.module.ts`, type: 'render' },
  ],
  injection: { 
    moduleName: 'LoggerModule', 
    importPath: () => `${getRelativeImportPath(PATHS.LOGGER)}/logger.module` 
  },
};
