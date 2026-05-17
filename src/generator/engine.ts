import { PromptAnswers } from '../features/types.js';
import { FEATURES } from '../features/index.js';
import { FileInjection, DockerService } from '../features/types.js';
import { injectModuleToAppModule } from './ast-utils.js';
import { spawn } from 'child_process';
import ejs from 'ejs';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { updateDockerCompose } from './compose-utils.js';
import { 
  NEST_CLI_COMMAND,
  TEMPLATE_LOOKUP_DEPTH, 
  NEST_CLI_CONFIG_FILE,
  APP_MODULE_FILE,
  PACKAGE_JSON_FILE,
  PROTOCOLS
} from '../constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Safely executes a command without shell interpretation.
 */
function safeExec(command: string, args: string[], options: any = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    // Pipe stdio to avoid terminal flickering while ora spinner is active
    const child = spawn(command, args, { stdio: 'pipe', shell: false, ...options });
    
    let stderr = '';
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command "${command} ${args.join(' ')}" failed with code ${code}\n${stderr}`));
    });
    child.on('error', reject);
  });
}

/**
 * Locate the templates directory relative to the current file.
 * Resilient to different build/bundle layouts.
 */
function findTemplatesDir(): string {
  let dir = __dirname;
  for (let i = 0; i < TEMPLATE_LOOKUP_DEPTH; i++) {
    const candidate = path.join(dir, 'templates');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  throw new Error(`Could not locate the templates/ directory. Looked from: ${__dirname}`);
}

const TEMPLATES_DIR = findTemplatesDir();

/**
 * Renders an EJS template with provided data.
 */
async function renderTemplate(templatePath: string, data: object): Promise<string> {
  const content = await fs.readFile(templatePath, 'utf-8');
  return ejs.render(content, data, { async: false });
}

/**
 * Renders a template and writes it to the destination.
 */
async function writeRendered(templatePath: string, destPath: string, data: object): Promise<void> {
  const rendered = await renderTemplate(templatePath, data);
  await fs.outputFile(destPath, rendered);
}

/**
 * Resolves all resources (files, dependencies, injections, services) for a given set of features.
 * Consolidates extraction logic to prevent duplication between generateProject and addFeature.
 */
function resolveFeatureResources(features: typeof FEATURES, answers: PromptAnswers) {
  const dependencies: Set<string> = new Set();
  const devDependencies: Set<string> = new Set();
  const files: FileInjection[] = [];
  const dockerServices: Record<string, DockerService> = {};
  const injections: { moduleName: string; importPath: string }[] = [];

  for (const feature of features) {
    if (feature.condition(answers)) {
      // 1. Dependencies
      const deps = typeof feature.dependencies === 'function' ? feature.dependencies(answers) : (feature.dependencies || []);
      const devDeps = typeof feature.devDependencies === 'function' ? feature.devDependencies(answers) : (feature.devDependencies || []);
      deps.forEach(d => dependencies.add(d));
      devDeps.forEach(d => devDependencies.add(d));

      // 2. Files
      if (feature.files) {
        files.push(...feature.files(answers));
      }

      // 3. Docker Services
      if (feature.dockerServices) {
        const services = typeof feature.dockerServices === 'function' ? feature.dockerServices(answers) : feature.dockerServices;
        Object.assign(dockerServices, services);
      }

      // 4. Module Injections (AppModule)
      if (feature.injection) {
        const importPath = typeof feature.injection.importPath === 'function'
          ? feature.injection.importPath(answers)
          : feature.injection.importPath;
        
        injections.push({
          moduleName: feature.injection.moduleName,
          importPath
        });
      }
    }
  }

  return {
    dependencies: Array.from(dependencies),
    devDependencies: Array.from(devDependencies),
    files,
    dockerServices,
    injections,
  };
}

/**
 * Generates a complete project based on user answers.
 */
export async function generateProject(answers: PromptAnswers): Promise<void> {
  const targetDir = path.join(process.cwd(), answers.projectName);

  const spinner = ora('Scaffolding base NestJS project via @nestjs/cli...').start();
  try {
    // npx --yes @nestjs/cli new <name> --package-manager <pm> --skip-git --strict
    const nestArgs = [
      '--yes', 
      '@nestjs/cli', 
      'new', 
      answers.projectName, 
      '--package-manager', 
      answers.packageManager, 
      '--skip-git', 
      '--strict'
    ];
    if (answers.skipInstall) {
      nestArgs.push('--skip-install');
    }
    await safeExec('npx', nestArgs);
    spinner.succeed(`Base project created at ${chalk.cyan(`./${answers.projectName}`)}`);
  } catch (err) {
    spinner.fail('Failed to scaffold base project.');
    // Cleanup on failure
    if (fs.existsSync(targetDir)) {
      await fs.remove(targetDir);
    }
    throw err;
  }

  // Step 1: Collect all required resources
  const resources = resolveFeatureResources(FEATURES, answers);

  // Step 2: Install additional packages
  if (answers.skipInstall) {
    spinner.info('Skipping package installation as requested.');
  } else {
    spinner.start(`Installing ${resources.dependencies.length} additional packages...`);
    try {
      if (resources.dependencies.length > 0) {
        const cmd = answers.packageManager === 'npm' ? 'install' : 'add';
        await safeExec(answers.packageManager, [cmd, ...resources.dependencies], { cwd: targetDir });
      }

      if (resources.devDependencies.length > 0) {
        const cmd = answers.packageManager === 'npm' ? 'install' : 'add';
        const devFlag = answers.packageManager === 'npm' ? '-D' : '--dev';
        await safeExec(answers.packageManager, [cmd, devFlag, ...resources.devDependencies], { cwd: targetDir });
      }
      spinner.succeed('Additional packages installed.');
    } catch (err) {
      spinner.warn('Some packages failed to install. You may need to install them manually.');
      console.error(err);
    }
  }

  // Step 3: Inject custom files and templates
  spinner.start('Generating and injecting custom modules...');
  const tplData = { ...answers };

  // Parallel file writing
  await Promise.all(resources.files.map(async (file) => {
    const fullSrcPath = path.join(TEMPLATES_DIR, file.src);
    const fullDestPath = path.join(targetDir, file.dest);

    if (file.type === 'render') {
      await writeRendered(fullSrcPath, fullDestPath, tplData);
    } else {
      await fs.ensureDir(path.dirname(fullDestPath));
      await fs.copy(fullSrcPath, fullDestPath);
    }
  }));

  // Step 4: Infrastructure & AST Injection
  await updateNestCliConfig(targetDir, answers);

  if (Object.keys(resources.dockerServices).length > 0) {
    await updateDockerCompose(targetDir, resources.dockerServices);
  }

  for (const injection of resources.injections) {
    await injectModuleToAppModule(targetDir, injection);
  }

  await updatePackageJsonScripts(targetDir);

  spinner.succeed('Modules injected successfully.');

  // Step 5: Display Summary
  console.log('');
  console.log(chalk.bold.green('✅ Scaffolding complete!'));
  console.log('');
  console.log(chalk.bold('📁 Project structure:'));
  console.log(chalk.cyan(`  cd ${answers.projectName}`));
  console.log(chalk.cyan('  cp .env.example .env'));
  console.log(chalk.cyan(`  ${answers.packageManager} run start:dev`));
  console.log('');
}

/**
 * Adds a single feature to an existing project.
 */
export async function addFeature(featureName: string, answers: PromptAnswers): Promise<void> {
  const targetDir = process.cwd();
  const packageJsonPath = path.join(targetDir, PACKAGE_JSON_FILE);

  if (!fs.existsSync(packageJsonPath) || !fs.existsSync(path.join(targetDir, APP_MODULE_FILE))) {
    throw new Error('This command must be run from the root of a NestJS project.');
  }

  const pkg = await fs.readJson(packageJsonPath);
  const packageManager = fs.existsSync(path.join(targetDir, 'yarn.lock')) ? 'yarn' :
    fs.existsSync(path.join(targetDir, 'pnpm-lock.yaml')) ? 'pnpm' : 'npm';

  const feature = FEATURES.find(f => f.name.toLowerCase() === featureName.toLowerCase());
  if (!feature) {
    throw new Error(`Unknown feature: ${featureName}`);
  }

  if (feature.files) {
    const existingFiles = feature.files(answers)
      .filter(f => f.type !== 'copy') 
      .map(f => path.join(targetDir, f.dest))
      .filter(p => fs.existsSync(p));

    if (existingFiles.length > 0) {
      const relPaths = existingFiles.map(p => path.relative(targetDir, p)).join(', ');
      throw new Error(
        `Feature "${featureName}" appears to already be installed.\n` +
        `  Existing files detected: ${relPaths}\n` +
        `  Remove them first if you want to re-scaffold this feature.`
      );
    }
  }

  const spinner = ora(`Adding feature ${chalk.cyan(feature.name)}...`).start();

  const resources = resolveFeatureResources([feature], answers);

  try {
    // 1. Install dependencies
    if (resources.dependencies.length > 0) {
      spinner.text = `Installing dependencies for ${feature.name}...`;
      const cmd = packageManager === 'npm' ? 'install' : 'add';
      await safeExec(packageManager, [cmd, ...resources.dependencies], { cwd: targetDir });
    }

    if (resources.devDependencies.length > 0) {
      spinner.text = `Installing devDependencies for ${feature.name}...`;
      const cmd = packageManager === 'npm' ? 'install' : 'add';
      const devFlag = packageManager === 'npm' ? '-D' : '--dev';
      await safeExec(packageManager, [cmd, devFlag, ...resources.devDependencies], { cwd: targetDir });
    }

    // 2. Inject files
    if (resources.files.length > 0) {
      spinner.text = `Generating files for ${feature.name}...`;
      const tplData = { ...answers, projectName: pkg.name };

      await Promise.all(resources.files.map(async (file) => {
        const fullSrcPath = path.join(TEMPLATES_DIR, file.src);
        const fullDestPath = path.join(targetDir, file.dest);

        if (file.type === 'render') {
          await writeRendered(fullSrcPath, fullDestPath, tplData);
        } else {
          await fs.ensureDir(path.dirname(fullDestPath));
          await fs.copy(fullSrcPath, fullDestPath);
        }
      }));
    }

    // 3. Auto-inject into app.module.ts
    for (const injection of resources.injections) {
      spinner.text = `Injecting ${injection.moduleName} into app.module.ts...`;
      await injectModuleToAppModule(targetDir, injection);
    }

    await updateNestCliConfig(targetDir, answers);
    await updatePackageJsonScripts(targetDir);

    // 4. Update Docker
    if (Object.keys(resources.dockerServices).length > 0) {
      spinner.text = `Updating docker-compose.yml for ${feature.name}...`;
      await updateDockerCompose(targetDir, resources.dockerServices);
    }

    spinner.succeed(`Feature ${chalk.cyan(feature.name)} added successfully!`);
  } catch (err) {
    spinner.fail(`Failed to add feature ${feature.name}.`);
    throw err;
  }
}

/**
 * Updates nest-cli.json to include assets like .proto files in the build.
 */
async function updateNestCliConfig(targetDir: string, answers: PromptAnswers): Promise<void> {
  const configPath = path.join(targetDir, NEST_CLI_CONFIG_FILE);
  if (!fs.existsSync(configPath)) return;

  try {
    const config = await fs.readJson(configPath);
    config.compilerOptions = config.compilerOptions || {};

    const assets = new Set(config.compilerOptions.assets || []);

    if (answers.protocols?.includes(PROTOCOLS.GRPC)) {
      assets.add('**/*.proto');
    }

    if (assets.size > 0) {
      config.compilerOptions.assets = Array.from(assets);
      config.compilerOptions.watchAssets = true;
      await fs.writeJson(configPath, config, { spaces: 2 });
    }
  } catch (err) {
    console.error(chalk.yellow('\n⚠️  Could not update nest-cli.json assets. You may need to add them manually.'));
  }
}

/**
 * Hardens package.json scripts for production-grade testing (e2e cleanup).
 */
async function updatePackageJsonScripts(targetDir: string): Promise<void> {
  const pkgPath = path.join(targetDir, PACKAGE_JSON_FILE);
  if (!fs.existsSync(pkgPath)) return;

  try {
    const pkg = await fs.readJson(pkgPath);
    pkg.scripts = pkg.scripts || {};
    
    // Add hardening flags to e2e tests
    if (pkg.scripts['test:e2e']) {
      // --runInBand: prevents parallel port conflicts
      // --forceExit: ensures process exits even if DB pools take time to close
      // --detectOpenHandles: helps developers debug leaks
      pkg.scripts['test:e2e'] = 'jest --config ./test/jest-e2e.json --runInBand --forceExit --detectOpenHandles';
    }
    
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  } catch (err) {
    console.error(chalk.yellow('\n⚠️  Could not update package.json scripts.'));
  }
}
