import { injectModuleToAppModule } from '../src/generator/ast-utils.js';
import fs from 'fs-extra';
import path from 'path';

describe('AST Utils', () => {
  const tempDir = path.join(process.cwd(), 'temp-test-ast');
  const appModulePath = path.join(tempDir, 'src/app.module.ts');

  beforeEach(async () => {
    await fs.ensureDir(path.dirname(appModulePath));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should inject a new module into an empty imports array', async () => {
    const initialContent = `
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
    `;
    await fs.writeFile(appModulePath, initialContent);

    await injectModuleToAppModule(tempDir, {
      moduleName: 'MyNewModule',
      importPath: './my/new.module',
    });

    const modifiedContent = await fs.readFile(appModulePath, 'utf8');

    expect(modifiedContent).toContain("import { MyNewModule } from './my/new.module';");
    expect(modifiedContent).toContain('imports: [MyNewModule]');
  });

  it('should create the imports array if it does not exist', async () => {
    const initialContent = `
import { Module } from '@nestjs/common';

@Module({
  controllers: [],
})
export class AppModule {}
    `;
    await fs.writeFile(appModulePath, initialContent);

    await injectModuleToAppModule(tempDir, {
      moduleName: 'MyNewModule',
      importPath: './my/new.module',
    });

    const modifiedContent = await fs.readFile(appModulePath, 'utf8');

    expect(modifiedContent).toContain('imports: [MyNewModule]');
  });

  it('should add to an existing imports array', async () => {
    const initialContent = `
import { Module } from '@nestjs/common';
import { ExistingModule } from './existing';

@Module({
  imports: [ExistingModule],
})
export class AppModule {}
    `;
    await fs.writeFile(appModulePath, initialContent);

    await injectModuleToAppModule(tempDir, {
      moduleName: 'MyNewModule',
      importPath: './my/new.module',
    });

    const modifiedContent = await fs.readFile(appModulePath, 'utf8');

    expect(modifiedContent).toContain('imports: [ExistingModule, MyNewModule]');
  });

  it('should not inject duplicate modules', async () => {
    const initialContent = `
import { Module } from '@nestjs/common';
import { MyNewModule } from './my/new.module';

@Module({
  imports: [MyNewModule],
})
export class AppModule {}
    `;
    await fs.writeFile(appModulePath, initialContent);

    await injectModuleToAppModule(tempDir, {
      moduleName: 'MyNewModule',
      importPath: './my/new.module',
    });

    const modifiedContent = await fs.readFile(appModulePath, 'utf8');

    // The import statement should only appear once
    const importMatches = modifiedContent.match(/import { MyNewModule } from '.\/my\/new.module';/g);
    expect(importMatches?.length).toBe(1);

    // The imports array should only have it once
    expect(modifiedContent).toContain('imports: [MyNewModule]');
    expect(modifiedContent).not.toContain('imports: [MyNewModule, MyNewModule]');
  });

  describe('Error Handling', () => {
    it('should throw if AppModule class is missing', async () => {
      const initialContent = `export class SomeOtherClass {}`;
      await fs.writeFile(appModulePath, initialContent);

      await expect(
        injectModuleToAppModule(tempDir, { moduleName: 'Test', importPath: './test' })
      ).rejects.toThrow('Could not find AppModule class in src/app.module.ts');
    });

    it('should throw if @Module decorator is missing', async () => {
      const initialContent = `export class AppModule {}`;
      await fs.writeFile(appModulePath, initialContent);

      await expect(
        injectModuleToAppModule(tempDir, { moduleName: 'Test', importPath: './test' })
      ).rejects.toThrow('Could not find @Module decorator on AppModule class');
    });

    it('should throw if @Module decorator is missing its object literal argument', async () => {
      const initialContent = `
import { Module } from '@nestjs/common';
@Module()
export class AppModule {}`;
      await fs.writeFile(appModulePath, initialContent);

      await expect(
        injectModuleToAppModule(tempDir, { moduleName: 'Test', importPath: './test' })
      ).rejects.toThrow('@Module decorator must have an object literal argument');
    });
  });
});
