import type { FeatureConfig, FileInjection } from './types.js';
import { PATHS, PROTOCOLS, DATABASES, ORMS, FEATURE_NAMES } from '../constants/index.js';

/**
 * REST CRUD Feature
 * 
 * Generates sample CRUD controllers and tests when both REST and a database are selected.
 */
export const restCrudFeature: FeatureConfig = {
  name: FEATURE_NAMES.REST_CRUD,
  condition: (a) =>
    a.protocols.includes(PROTOCOLS.REST) &&
    a.database &&
    (
      (a.databases?.includes(DATABASES.POSTGRESQL) && a.postgresOrm === ORMS.TYPEORM) ||
      (a.databases?.includes(DATABASES.MYSQL) && a.mysqlOrm === ORMS.TYPEORM) ||
      !!a.databases?.includes(DATABASES.MONGODB)
    ),
  dependencies: (a) => {
    const deps = [];
    if (!a.apiDocs) deps.push('@nestjs/mapped-types');
    return deps;
  },
  files: (a): FileInjection[] => {
    const files: FileInjection[] = [];
    const restExamplePath = `${PATHS.EXAMPLES}/rest`;
    const dtoPath = `${restExamplePath}/dto`;

    const addDtoFiles = () => {
      if (files.some(f => f.dest.includes('/dto/'))) return;
      files.push({
        src: 'modules/rest-crud/dto/create-example.dto.ts.ejs',
        dest: `${dtoPath}/create-example.dto.ts`,
        type: 'render',
      });
      files.push({
        src: 'modules/rest-crud/dto/update-example.dto.ts.ejs',
        dest: `${dtoPath}/update-example.dto.ts`,
        type: 'render',
      });
    };

    // PostgreSQL with TypeORM
    if (a.databases?.includes(DATABASES.POSTGRESQL) && a.postgresOrm === ORMS.TYPEORM) {
      addDtoFiles();
      files.push({
        src: 'modules/rest-crud/postgres-controller.ts.ejs',
        dest: `${restExamplePath}/postgres-example.controller.ts`,
        type: 'render',
      });
      files.push({
        src: 'modules/rest-crud/postgres-controller.spec.ts.ejs',
        dest: `${restExamplePath}/postgres-example.controller.spec.ts`,
        type: 'render',
      });
    }

    // MySQL with TypeORM
    if (a.databases?.includes(DATABASES.MYSQL) && a.mysqlOrm === ORMS.TYPEORM) {
      addDtoFiles();
      files.push({
        src: 'modules/rest-crud/mysql-controller.ts.ejs',
        dest: `${restExamplePath}/mysql-example.controller.ts`,
        type: 'render',
      });
      files.push({
        src: 'modules/rest-crud/mysql-controller.spec.ts.ejs',
        dest: `${restExamplePath}/mysql-example.controller.spec.ts`,
        type: 'render',
      });
    }

    // MongoDB with Mongoose
    if (a.databases?.includes(DATABASES.MONGODB)) {
      addDtoFiles();
      files.push({
        src: 'modules/rest-crud/mongoose-controller.ts.ejs',
        dest: `${restExamplePath}/mongo-example.controller.ts`,
        type: 'render',
      });
      files.push({
        src: 'modules/rest-crud/mongoose-controller.spec.ts.ejs',
        dest: `${restExamplePath}/mongo-example.controller.spec.ts`,
        type: 'render',
      });
    }

    if (files.length > 0) {
      files.push({
        src: 'modules/rest-crud/examples.module.ts.ejs',
        dest: `${PATHS.EXAMPLES}/examples.module.ts`,
        type: 'render',
      });
    }

    return files;
  },
  injection: {
    moduleName: 'ExamplesModule',
    importPath: './examples/examples.module',
  },
};
