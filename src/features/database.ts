import type { FeatureConfig } from './types.js';
import { PATHS, DATABASES, ORMS, FEATURE_NAMES } from '../constants/index.js';
import { getPostgresService, getMysqlService, getMongoService } from './infrastructure.js';
import { getRelativeImportPath } from './utils.js';

// ─────────────────────────────────────────────
// PostgreSQL — TypeORM
// ─────────────────────────────────────────────
export const postgresTypeOrmFeature: FeatureConfig = {
  name: FEATURE_NAMES.POSTGRESQL,
  condition: (a) => !!a.databases?.includes(DATABASES.POSTGRESQL) && a.postgresOrm === ORMS.TYPEORM,
  dependencies: ['@nestjs/typeorm', 'typeorm', 'pg'],
  devDependencies: ['@types/pg'],
  files: () => [
    { src: 'modules/database/postgres-typeorm/database.module.ts.ejs', dest: `${PATHS.DATABASE}/postgres/database.module.ts`, type: 'render' },
    { src: 'modules/database/postgres-typeorm/database.service.ts.ejs', dest: `${PATHS.DATABASE}/postgres/database.service.ts`, type: 'render' },
    { src: 'modules/database/postgres-typeorm/database.service.spec.ts.ejs', dest: `${PATHS.DATABASE}/postgres/database.service.spec.ts`, type: 'render' },
    { src: 'modules/database/postgres-typeorm/example.entity.ts.ejs', dest: `${PATHS.DATABASE}/postgres/example.entity.ts`, type: 'render' },
  ],
  injection: { 
    moduleName: 'PostgresDatabaseModule', 
    importPath: () => `${getRelativeImportPath(PATHS.DATABASE)}/postgres/database.module` 
  },
  dockerServices: () => ({ postgres: getPostgresService() }),
};

// ─────────────────────────────────────────────
// PostgreSQL — Prisma
// ─────────────────────────────────────────────
export const postgresPrismaFeature: FeatureConfig = {
  name: FEATURE_NAMES.POSTGRESQL,
  condition: (a) => !!a.databases?.includes(DATABASES.POSTGRESQL) && a.postgresOrm === ORMS.PRISMA,
  dependencies: ['@prisma/client'],
  devDependencies: ['prisma'],
  files: () => [
    { src: 'modules/database/postgres-prisma/prisma.module.ts.ejs', dest: `${PATHS.DATABASE}/postgres/prisma.module.ts`, type: 'render' },
    { src: 'modules/database/postgres-prisma/prisma.service.ts.ejs', dest: `${PATHS.DATABASE}/postgres/prisma.service.ts`, type: 'render' },
    { src: 'modules/database/postgres-prisma/schema.prisma.ejs', dest: `${PATHS.DATABASE}/postgres/prisma/schema.prisma`, type: 'render' },
  ],
  injection: { 
    moduleName: 'PostgresPrismaModule', 
    importPath: () => `${getRelativeImportPath(PATHS.DATABASE)}/postgres/prisma.module` 
  },
  dockerServices: () => ({ postgres: getPostgresService() }),
};

// ─────────────────────────────────────────────
// MySQL — TypeORM
// ─────────────────────────────────────────────
export const mysqlTypeOrmFeature: FeatureConfig = {
  name: FEATURE_NAMES.MYSQL,
  condition: (a) => !!a.databases?.includes(DATABASES.MYSQL) && a.mysqlOrm === ORMS.TYPEORM,
  dependencies: ['@nestjs/typeorm', 'typeorm', 'mysql2'],
  files: () => [
    { src: 'modules/database/mysql-typeorm/database.module.ts.ejs', dest: `${PATHS.DATABASE}/mysql/database.module.ts`, type: 'render' },
    { src: 'modules/database/mysql-typeorm/database.service.ts.ejs', dest: `${PATHS.DATABASE}/mysql/database.service.ts`, type: 'render' },
    { src: 'modules/database/mysql-typeorm/database.service.spec.ts.ejs', dest: `${PATHS.DATABASE}/mysql/database.service.spec.ts`, type: 'render' },
    { src: 'modules/database/mysql-typeorm/example.entity.ts.ejs', dest: `${PATHS.DATABASE}/mysql/example.entity.ts`, type: 'render' },
  ],
  injection: { 
    moduleName: 'MysqlDatabaseModule', 
    importPath: () => `${getRelativeImportPath(PATHS.DATABASE)}/mysql/database.module` 
  },
  dockerServices: () => ({ mysql: getMysqlService() }),
};

// ─────────────────────────────────────────────
// MySQL — Prisma
// ─────────────────────────────────────────────
export const mysqlPrismaFeature: FeatureConfig = {
  name: FEATURE_NAMES.MYSQL,
  condition: (a) => !!a.databases?.includes(DATABASES.MYSQL) && a.mysqlOrm === ORMS.PRISMA,
  dependencies: ['@prisma/client'],
  devDependencies: ['prisma'],
  files: () => [
    { src: 'modules/database/mysql-prisma/prisma.module.ts.ejs', dest: `${PATHS.DATABASE}/mysql/prisma.module.ts`, type: 'render' },
    { src: 'modules/database/mysql-prisma/prisma.service.ts.ejs', dest: `${PATHS.DATABASE}/mysql/prisma.service.ts`, type: 'render' },
    { src: 'modules/database/mysql-prisma/schema.prisma.ejs', dest: `${PATHS.DATABASE}/mysql/prisma/schema.prisma`, type: 'render' },
  ],
  injection: { 
    moduleName: 'MysqlPrismaModule', 
    importPath: () => `${getRelativeImportPath(PATHS.DATABASE)}/mysql/prisma.module` 
  },
  dockerServices: () => ({ mysql: getMysqlService() }),
};

// ─────────────────────────────────────────────
// MongoDB — Mongoose
// ─────────────────────────────────────────────
export const mongooseFeature: FeatureConfig = {
  name: FEATURE_NAMES.MONGODB,
  condition: (a) => !!a.databases?.includes(DATABASES.MONGODB),
  dependencies: ['@nestjs/mongoose', 'mongoose'],
  files: () => [
    { src: 'modules/database/mongo/database.module.ts.ejs', dest: `${PATHS.DATABASE}/mongo/database.module.ts`, type: 'render' },
    { src: 'modules/database/mongo/database.service.ts.ejs', dest: `${PATHS.DATABASE}/mongo/database.service.ts`, type: 'render' },
    { src: 'modules/database/mongo/database.service.spec.ts.ejs', dest: `${PATHS.DATABASE}/mongo/database.service.spec.ts`, type: 'render' },
    { src: 'modules/database/mongo/example.schema.ts.ejs', dest: `${PATHS.DATABASE}/mongo/example.entity.ts`, type: 'render' },
  ],
  injection: { 
    moduleName: 'MongoDatabaseModule', 
    importPath: () => `${getRelativeImportPath(PATHS.DATABASE)}/mongo/database.module` 
  },
  dockerServices: (a) => ({ mongo: getMongoService(a) }),
};
