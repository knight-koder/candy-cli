import { describe, it, expect } from '@jest/globals';
import { restCrudFeature } from '../../src/features/rest-crud';
import { PromptAnswers } from '../../src/features/types.js';

describe('restCrudFeature', () => {
  const mockAnswers = (overrides: Partial<PromptAnswers> = {}): PromptAnswers => ({
    projectName: 'test-app',
    packageManager: 'npm',
    protocols: ['REST'],
    httpAdapter: 'Express',
    database: true,
    databases: ['PostgreSQL'],
    postgresOrm: 'TypeORM',
    messagingQueue: false,
    redisCache: false,
    logger: 'Winston',
    observability: 'OpenTelemetry',
    apiDocs: true,
    opossum: false,
    dlqAndRetries: false,
    ...overrides,
  });

  it('should be active when REST and database are selected', () => {
    expect(restCrudFeature.condition(mockAnswers())).toBe(true);
  });

  it('should be inactive when REST is missing', () => {
    expect(restCrudFeature.condition(mockAnswers({ protocols: [] }))).toBe(false);
  });

  it('should be inactive when database is missing', () => {
    expect(restCrudFeature.condition(mockAnswers({ database: false }))).toBe(false);
  });

  it('should return postgres controller when PostgreSQL TypeORM is selected', () => {
    const files = restCrudFeature.files!(mockAnswers({ databases: ['PostgreSQL'], postgresOrm: 'TypeORM' }));
    expect(files).toContainEqual(expect.objectContaining({
      src: 'modules/rest-crud/postgres-controller.ts.ejs',
      dest: 'src/examples/rest/postgres-example.controller.ts',
    }));
    expect(files).toContainEqual(expect.objectContaining({
      src: 'modules/rest-crud/postgres-controller.spec.ts.ejs',
      dest: 'src/examples/rest/postgres-example.controller.spec.ts',
    }));
    expect(files).toContainEqual(expect.objectContaining({
      src: 'modules/rest-crud/examples.module.ts.ejs',
      dest: 'src/examples/examples.module.ts',
    }));
  });

  it('should return mysql controller when MySQL TypeORM is selected', () => {
    const files = restCrudFeature.files!(mockAnswers({ databases: ['MySQL'], mysqlOrm: 'TypeORM' }));
    expect(files).toContainEqual(expect.objectContaining({
      src: 'modules/rest-crud/mysql-controller.ts.ejs',
      dest: 'src/examples/rest/mysql-example.controller.ts',
    }));
    expect(files).toContainEqual(expect.objectContaining({
      src: 'modules/rest-crud/mysql-controller.spec.ts.ejs',
      dest: 'src/examples/rest/mysql-example.controller.spec.ts',
    }));
  });

  it('should return mongo controller when MongoDB is selected', () => {
    const files = restCrudFeature.files!(mockAnswers({ databases: ['MongoDB'] }));
    expect(files).toContainEqual(expect.objectContaining({
      src: 'modules/rest-crud/mongoose-controller.ts.ejs',
      dest: 'src/examples/rest/mongo-example.controller.ts',
    }));
    expect(files).toContainEqual(expect.objectContaining({
      src: 'modules/rest-crud/mongoose-controller.spec.ts.ejs',
      dest: 'src/examples/rest/mongo-example.controller.spec.ts',
    }));
  });

  it('should return multiple controllers if multiple databases are selected', () => {
    const files = restCrudFeature.files!(mockAnswers({
      databases: ['PostgreSQL', 'MongoDB'],
      postgresOrm: 'TypeORM'
    }));
    expect(files.some(f => f.dest === 'src/examples/rest/postgres-example.controller.ts')).toBe(true);
    expect(files.some(f => f.dest === 'src/examples/rest/mongo-example.controller.ts')).toBe(true);
    expect(files.some(f => f.dest === 'src/examples/examples.module.ts')).toBe(true);
  });

  it('should have the correct injection config', () => {
    expect(restCrudFeature.injection).toEqual({
      moduleName: 'ExamplesModule',
      importPath: './examples/examples.module',
    });
  });
});
