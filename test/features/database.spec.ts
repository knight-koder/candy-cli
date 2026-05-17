import { FEATURES } from '../../src/features/index.js';
import { FeatureConfig, DockerService, PromptAnswers } from '../../src/features/types.js';
import { DOCKER_IMAGES, PATHS } from '../../src/constants/index.js';

function resolveDockerServices(feature: FeatureConfig, answers: PromptAnswers): Record<string, DockerService> {
  if (!feature.dockerServices) return {};
  return typeof feature.dockerServices === 'function' 
    ? feature.dockerServices(answers) 
    : feature.dockerServices;
}

function resolveDependencies(feature: FeatureConfig, answers: PromptAnswers): string[] {
  if (!feature.dependencies) return [];
  return typeof feature.dependencies === 'function' ? feature.dependencies(answers) : feature.dependencies;
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

const pgTypeOrm = FEATURES.find(f => f.name === 'PostgreSQL' && resolveDependencies(f, {} as PromptAnswers).includes('typeorm'))!;
const pgPrisma  = FEATURES.find(f => f.name === 'PostgreSQL' && resolveDependencies(f, {} as PromptAnswers).includes('@prisma/client'))!;
const mysqlTypeOrm = FEATURES.find(f => f.name === 'MySQL' && resolveDependencies(f, {} as PromptAnswers).includes('typeorm'))!;
const mysqlPrisma  = FEATURES.find(f => f.name === 'MySQL' && resolveDependencies(f, {} as PromptAnswers).includes('@prisma/client'))!;
const mongo = FEATURES.find(f => f.name === 'MongoDB')!;

describe('Databases', () => {
  describe('Conditions', () => {
    it('should correctly evaluate PostgreSQL conditions', () => {
      expect(pgTypeOrm.condition(mockAnswers({ databases: ['PostgreSQL'], postgresOrm: 'TypeORM' }))).toBe(true);
      expect(pgTypeOrm.condition(mockAnswers({ databases: ['PostgreSQL'], postgresOrm: 'Prisma' }))).toBe(false);

      expect(pgPrisma.condition(mockAnswers({ databases: ['PostgreSQL'], postgresOrm: 'Prisma' }))).toBe(true);
      expect(pgPrisma.condition(mockAnswers({ databases: ['PostgreSQL'], postgresOrm: 'TypeORM' }))).toBe(false);
    });

    it('should correctly evaluate MySQL conditions', () => {
      expect(mysqlTypeOrm.condition(mockAnswers({ databases: ['MySQL'], mysqlOrm: 'TypeORM' }))).toBe(true);
      expect(mysqlPrisma.condition(mockAnswers({ databases: ['MySQL'], mysqlOrm: 'Prisma' }))).toBe(true);
    });

    it('should correctly evaluate MongoDB conditions', () => {
      expect(mongo.condition(mockAnswers({ databases: ['MongoDB'] }))).toBe(true);
      expect(mongo.condition(mockAnswers({ databases: [] }))).toBe(false);
    });
  });

  describe('TypeORM', () => {
    it('should have correct PostgreSQL configuration', () => {
      expect(resolveDependencies(pgTypeOrm, mockAnswers())).toEqual(['@nestjs/typeorm', 'typeorm', 'pg']);
      expect(resolveInjection(pgTypeOrm, mockAnswers())).toEqual({ moduleName: 'PostgresDatabaseModule', importPath: './database/postgres/database.module' });

      const files = pgTypeOrm.files!(mockAnswers());
      expect(files.map(f => f.dest)).toContain(`${PATHS.DATABASE}/postgres/database.module.ts`);
      expect(files.map(f => f.dest)).toContain(`${PATHS.DATABASE}/postgres/database.service.ts`);
      expect(files.map(f => f.dest)).toContain(`${PATHS.DATABASE}/postgres/example.entity.ts`);
    });

    it('should have correct MySQL configuration', () => {
      expect(resolveDependencies(mysqlTypeOrm, mockAnswers())).toEqual(['@nestjs/typeorm', 'typeorm', 'mysql2']);
      expect(resolveInjection(mysqlTypeOrm, mockAnswers())).toEqual({ moduleName: 'MysqlDatabaseModule', importPath: './database/mysql/database.module' });

      const files = mysqlTypeOrm.files!(mockAnswers());
      expect(files.map(f => f.dest)).toContain(`${PATHS.DATABASE}/mysql/database.module.ts`);
      expect(files.map(f => f.dest)).toContain(`${PATHS.DATABASE}/mysql/example.entity.ts`);
    });
  });

  describe('Prisma', () => {
    it('should have correct PostgreSQL configuration', () => {
      expect(resolveDependencies(pgPrisma, mockAnswers())).toEqual(['@prisma/client']);
      expect(resolveInjection(pgPrisma, mockAnswers())).toEqual({ moduleName: 'PostgresPrismaModule', importPath: './database/postgres/prisma.module' });

      const files = pgPrisma.files!(mockAnswers());
      expect(files.map(f => f.dest)).toContain(`${PATHS.DATABASE}/postgres/prisma/schema.prisma`);
      expect(files.map(f => f.dest)).toContain(`${PATHS.DATABASE}/postgres/prisma.module.ts`);
    });

    it('should have correct MySQL configuration', () => {
      expect(resolveDependencies(mysqlPrisma, mockAnswers())).toEqual(['@prisma/client']);
      expect(resolveInjection(mysqlPrisma, mockAnswers())).toEqual({ moduleName: 'MysqlPrismaModule', importPath: './database/mysql/prisma.module' });

      const files = mysqlPrisma.files!(mockAnswers());
      expect(files.map(f => f.dest)).toContain(`${PATHS.DATABASE}/mysql/prisma/schema.prisma`);
    });
  });

  describe('MongoDB / Mongoose', () => {
    it('should have correct configuration', () => {
      expect(resolveDependencies(mongo, mockAnswers())).toEqual(['@nestjs/mongoose', 'mongoose']);
      expect(resolveInjection(mongo, mockAnswers())).toEqual({ moduleName: 'MongoDatabaseModule', importPath: './database/mongo/database.module' });

      const files = mongo.files!(mockAnswers());
      expect(files.map(f => f.dest)).toContain(`${PATHS.DATABASE}/mongo/database.module.ts`);
      expect(files.map(f => f.dest)).toContain(`${PATHS.DATABASE}/mongo/database.service.ts`);
      expect(files.map(f => f.dest)).toContain(`${PATHS.DATABASE}/mongo/example.entity.ts`);
    });
  });

  describe('dockerServices', () => {
    it('should expose dockerServices as a function on all DB features', () => {
      expect(typeof pgTypeOrm.dockerServices).toBe('function');
      expect(typeof pgPrisma.dockerServices).toBe('function');
      expect(typeof mysqlTypeOrm.dockerServices).toBe('function');
      expect(typeof mysqlPrisma.dockerServices).toBe('function');
      expect(typeof mongo.dockerServices).toBe('function');
    });

    it('should return a postgres service for PostgreSQL + TypeORM', () => {
      const services = resolveDockerServices(pgTypeOrm, mockAnswers());
      expect(services).toHaveProperty('postgres');
      expect(services.postgres.image).toBe(DOCKER_IMAGES.POSTGRES);
      expect(services.postgres.ports).toContain('5432:5432');
      expect(services.postgres.volumes).toContain('postgres_data:/var/lib/postgresql/data');
      expect(services.postgres.environment).toMatchObject({
        POSTGRES_USER: '${POSTGRES_USER:-postgres}',
        POSTGRES_PASSWORD: '${POSTGRES_PASSWORD:-postgres}',
        POSTGRES_DB: '${POSTGRES_DB}',
      });
    });

    it('should return the same postgres service for PostgreSQL + Prisma', () => {
      const typeOrmServices = resolveDockerServices(pgTypeOrm, mockAnswers());
      const prismaServices  = resolveDockerServices(pgPrisma, mockAnswers());
      expect(prismaServices.postgres).toEqual(typeOrmServices.postgres);
    });

    it('should return a mysql service for MySQL + TypeORM', () => {
      const services = resolveDockerServices(mysqlTypeOrm, mockAnswers());
      expect(services).toHaveProperty('mysql');
      expect(services.mysql.image).toBe(DOCKER_IMAGES.MYSQL);
      expect(services.mysql.ports).toContain('3306:3306');
      expect(services.mysql.volumes).toContain('mysql_data:/var/lib/mysql');
      expect(services.mysql.environment).toMatchObject({
        MYSQL_ROOT_PASSWORD: '${MYSQL_ROOT_PASSWORD:-root}',
        MYSQL_USER: '${MYSQL_USER:-app}',
        MYSQL_PASSWORD: '${MYSQL_PASSWORD:-app}',
        MYSQL_DATABASE: '${MYSQL_DB}',
      });
    });

    it('should return the same mysql service for MySQL + Prisma', () => {
      const typeOrmServices = resolveDockerServices(mysqlTypeOrm, mockAnswers());
      const prismaServices  = resolveDockerServices(mysqlPrisma, mockAnswers());
      expect(prismaServices.mysql).toEqual(typeOrmServices.mysql);
    });

    it('should return a mongo service for MongoDB', () => {
      const services = resolveDockerServices(mongo, mockAnswers());
      expect(services).toHaveProperty('mongo');
      expect(services.mongo.image).toBe(DOCKER_IMAGES.MONGODB);
      expect(services.mongo.ports).toContain('27017:27017');
      expect(services.mongo.volumes).toContain('mongo_data:/data/db');
    });

    it('should use named volume format (not bind mount) for all DB services', () => {
      const checkNamedVolumes = (services: Record<string, DockerService>) => {
        for (const service of Object.values(services)) {
          if (!Array.isArray(service.volumes)) continue;
          for (const vol of service.volumes) {
            const name = vol.split(':')[0];
            expect(name).not.toMatch(/^[./]/);
          }
        }
      };
      checkNamedVolumes(resolveDockerServices(pgTypeOrm, mockAnswers()));
      checkNamedVolumes(resolveDockerServices(mysqlTypeOrm, mockAnswers()));
      checkNamedVolumes(resolveDockerServices(mongo, mockAnswers()));
    });
  });
});
