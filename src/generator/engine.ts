import { PromptAnswers } from '../prompts/index.js';
import { FEATURES, FileInjection } from './features.js';
import { injectModuleToAppModule } from './ast-utils.js';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
import ejs from 'ejs';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { updateDockerCompose } from './compose-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Locate the templates directory relative to the current file.
 * Resilient to different build/bundle layouts.
 */
function findTemplatesDir(): string {
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
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
 * Generates a complete project based on user answers.
 */
export async function generateProject(answers: PromptAnswers): Promise<void> {
  const targetDir = path.join(process.cwd(), answers.projectName);

  const spinner = ora('Scaffolding base NestJS project via @nestjs/cli...').start();
  try {
    await execAsync(
      `npx --yes @nestjs/cli new ${answers.projectName} --package-manager ${answers.packageManager} --skip-git --strict`
    );
    spinner.succeed(`Base project created at ${chalk.cyan(`./${answers.projectName}`)}`);
  } catch (err) {
    spinner.fail('Failed to scaffold base project.');
    throw err;
  }

  const dependencies: Set<string> = new Set();
  const devDependencies: Set<string> = new Set();
  const injections: FileInjection[] = [];
  const dockerServices: Record<string, any> = {};

  // Step 1: Collect all required resources from the registry
  for (const feature of FEATURES) {
    if (feature.condition(answers)) {
      feature.dependencies?.forEach((d) => dependencies.add(d));
      feature.devDependencies?.forEach((d) => devDependencies.add(d));
      if (feature.files) {
        injections.push(...feature.files(answers));
      }
      if (feature.dockerServices) {
        Object.assign(dockerServices, feature.dockerServices);
      }
    }
  }

  // Step 2: Install additional packages
  spinner.start(`Installing ${dependencies.size} additional packages...`);
  try {
    const installCmd = answers.packageManager === 'npm' ? 'npm install' : `${answers.packageManager} add`;
    if (dependencies.size > 0) {
      await execAsync(`${installCmd} ${Array.from(dependencies).join(' ')}`, { cwd: targetDir });
    }

    if (devDependencies.size > 0) {
      const devCmd = answers.packageManager === 'npm' ? 'npm install -D' : `${answers.packageManager} add -D`;
      await execAsync(`${devCmd} ${Array.from(devDependencies).join(' ')}`, { cwd: targetDir });
    }
    spinner.succeed('Additional packages installed.');
  } catch (err) {
    spinner.warn('Some packages failed to install. You may need to install them manually.');
    console.error(err);
  }

  // Step 3: Inject custom files and templates
  spinner.start('Generating and injecting custom modules...');
  const tplData = { ...answers };

  for (const injection of injections) {
    const fullSrcPath = path.join(TEMPLATES_DIR, injection.src);
    const fullDestPath = path.join(targetDir, injection.dest);

    if (injection.type === 'render') {
      await writeRendered(fullSrcPath, fullDestPath, tplData);
    } else {
      await fs.ensureDir(path.dirname(fullDestPath));
      await fs.copy(fullSrcPath, fullDestPath);
    }
  }
  await updateNestCliConfig(targetDir, answers);

  if (Object.keys(dockerServices).length > 0) {
    await updateDockerCompose(targetDir, dockerServices);
  }

  spinner.succeed('Modules injected successfully.');

  // Step 4: Display Summary
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
 * Uses AST manipulation to update app.module.ts.
 */
export async function addFeature(featureName: string, answers: PromptAnswers): Promise<void> {
  const targetDir = process.cwd();
  const packageJsonPath = path.join(targetDir, 'package.json');

  if (!fs.existsSync(packageJsonPath) || !fs.existsSync(path.join(targetDir, 'src/app.module.ts'))) {
    throw new Error('This command must be run from the root of a NestJS project.');
  }

  const pkg = await fs.readJson(packageJsonPath);
  const packageManager = fs.existsSync(path.join(targetDir, 'yarn.lock')) ? 'yarn' :
    fs.existsSync(path.join(targetDir, 'pnpm-lock.yaml')) ? 'pnpm' : 'npm';

  const feature = FEATURES.find(f => f.name.toLowerCase() === featureName.toLowerCase());
  if (!feature) {
    throw new Error(`Unknown feature: ${featureName}`);
  }

  // Guard: check if any of the feature's files already exist to prevent silent overwrites
  if (feature.files) {
    const existingFiles = feature.files(answers)
      .filter(f => f.type !== 'copy') // only check rendered files (these are the meaningful ones)
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

  // 1. Install dependencies
  const deps = feature.dependencies || [];
  const devDeps = feature.devDependencies || [];

  if (deps.length > 0) {
    spinner.text = `Installing dependencies for ${feature.name}...`;
    const installCmd = packageManager === 'npm' ? 'npm install' : `${packageManager} add`;
    await execAsync(`${installCmd} ${deps.join(' ')}`, { cwd: targetDir });
  }

  if (devDeps.length > 0) {
    spinner.text = `Installing devDependencies for ${feature.name}...`;
    const devCmd = packageManager === 'npm' ? 'npm install -D' : `${packageManager} add -D`;
    await execAsync(`${devCmd} ${devDeps.join(' ')}`, { cwd: targetDir });
  }

  // 2. Inject files
  if (feature.files) {
    spinner.text = `Generating files for ${feature.name}...`;
    const injections = feature.files(answers);
    const tplData = { ...answers, projectName: pkg.name };

    for (const injection of injections) {
      const fullSrcPath = path.join(TEMPLATES_DIR, injection.src);
      const fullDestPath = path.join(targetDir, injection.dest);

      if (injection.type === 'render') {
        await writeRendered(fullSrcPath, fullDestPath, tplData);
      } else {
        await fs.ensureDir(path.dirname(fullDestPath));
        await fs.copy(fullSrcPath, fullDestPath);
      }
    }
  }

  // 3. Auto-inject into app.module.ts via AST manipulation
  if (feature.injection) {
    spinner.text = `Injecting ${feature.injection.moduleName} into app.module.ts...`;
    await injectModuleToAppModule(targetDir, feature.injection);
  }

  await updateNestCliConfig(targetDir, answers);

  if (feature.dockerServices) {
    spinner.text = `Updating docker-compose.yml for ${feature.name}...`;
    await updateDockerCompose(targetDir, feature.dockerServices);
  }

  spinner.succeed(`Feature ${chalk.cyan(feature.name)} added successfully!`);
}

/**
 * Updates nest-cli.json to include assets like .proto files in the build.
 */
async function updateNestCliConfig(targetDir: string, answers: PromptAnswers): Promise<void> {
  const configPath = path.join(targetDir, 'nest-cli.json');
  if (!fs.existsSync(configPath)) return;

  try {
    const config = await fs.readJson(configPath);
    config.compilerOptions = config.compilerOptions || {};

    const assets = new Set(config.compilerOptions.assets || []);

    // Add gRPC proto files to assets if gRPC is used
    if (answers.protocols?.includes('gRPC')) {
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
