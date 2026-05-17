#!/usr/bin/env node
import {
  FEATURES
} from "./chunk-YYFPMQOX.js";
import {
  APP_MODULE_CLASS,
  APP_MODULE_FILE,
  DOCKER_COMPOSE_FILE,
  NEST_CLI_CONFIG_FILE,
  PACKAGE_JSON_FILE,
  PROTOCOLS,
  TEMPLATE_LOOKUP_DEPTH
} from "./chunk-VJ3SJRPV.js";

// src/generator/ast-utils.ts
import { Project, QuoteKind, SyntaxKind } from "ts-morph";
import path from "path";
async function injectModuleToAppModule(projectDir, injection) {
  const project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single
    }
  });
  const appModulePath = path.join(projectDir, APP_MODULE_FILE);
  const sourceFile = project.addSourceFileAtPath(appModulePath);
  const classDeclaration = sourceFile.getClass(APP_MODULE_CLASS);
  if (!classDeclaration) {
    throw new Error(`Could not find ${APP_MODULE_CLASS} class in ${APP_MODULE_FILE}`);
  }
  const moduleDecorator = classDeclaration.getDecorator("Module");
  if (!moduleDecorator) {
    throw new Error("Could not find @Module decorator on AppModule class");
  }
  const decoratorArg = moduleDecorator.getArguments()[0];
  if (!decoratorArg || !decoratorArg.isKind(SyntaxKind.ObjectLiteralExpression)) {
    throw new Error("@Module decorator must have an object literal argument");
  }
  const obj = decoratorArg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
  const importsProp = obj.getProperty("imports");
  if (!importsProp) {
    obj.addPropertyAssignment({
      name: "imports",
      initializer: `[${injection.moduleName}]`
    });
  } else if (importsProp.isKind(SyntaxKind.PropertyAssignment)) {
    const initializer = importsProp.getInitializer();
    if (initializer?.isKind(SyntaxKind.ArrayLiteralExpression)) {
      const arrayLiteral = initializer.asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
      const exists = arrayLiteral.getElements().some((e) => e.getText() === injection.moduleName);
      if (!exists) {
        arrayLiteral.addElement(injection.moduleName);
      }
    }
  }
  const existingImport = sourceFile.getImportDeclaration((i) => i.getModuleSpecifierValue() === injection.importPath);
  if (!existingImport) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: injection.importPath,
      namedImports: [injection.moduleName]
    });
  }
  sourceFile.formatText();
  await project.save();
}

// src/generator/engine.ts
import { spawn } from "child_process";
import ejs from "ejs";
import chalk from "chalk";
import ora from "ora";
import path3 from "path";
import fs2 from "fs-extra";
import { fileURLToPath } from "url";

// src/generator/compose-utils.ts
import fs from "fs-extra";
import path2 from "path";
import yaml from "yaml";
async function updateDockerCompose(targetDir, newServices) {
  const composePath = path2.join(targetDir, DOCKER_COMPOSE_FILE);
  let composeObj = { services: {} };
  if (fs.existsSync(composePath)) {
    const content = await fs.readFile(composePath, "utf8");
    try {
      composeObj = yaml.parse(content) || composeObj;
      if (!composeObj.services) composeObj.services = {};
    } catch (err) {
      console.warn(`Warning: Could not parse existing docker-compose.yml: ${err.message}`);
    }
  }
  composeObj.services = {
    ...composeObj.services,
    ...newServices
  };
  const namedVolumes = composeObj.volumes ?? {};
  for (const service of Object.values(composeObj.services)) {
    if (!Array.isArray(service?.volumes)) continue;
    for (const vol of service.volumes) {
      const volumeName = vol.split(":")[0];
      if (!volumeName.startsWith("/") && !volumeName.startsWith(".")) {
        namedVolumes[volumeName] = namedVolumes[volumeName] ?? null;
      }
    }
  }
  if (Object.keys(namedVolumes).length > 0) {
    composeObj.volumes = namedVolumes;
  }
  delete composeObj.version;
  const yamlStr = yaml.stringify(composeObj);
  await fs.outputFile(composePath, yamlStr);
}

// src/generator/engine.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
function safeExec(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "pipe", shell: false, ...options });
    let stderr = "";
    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command "${command} ${args.join(" ")}" failed with code ${code}
${stderr}`));
    });
    child.on("error", reject);
  });
}
function findTemplatesDir() {
  let dir = __dirname;
  for (let i = 0; i < TEMPLATE_LOOKUP_DEPTH; i++) {
    const candidate = path3.join(dir, "templates");
    if (fs2.existsSync(candidate)) return candidate;
    dir = path3.dirname(dir);
  }
  throw new Error(`Could not locate the templates/ directory. Looked from: ${__dirname}`);
}
var TEMPLATES_DIR = findTemplatesDir();
async function renderTemplate(templatePath, data) {
  const content = await fs2.readFile(templatePath, "utf-8");
  return ejs.render(content, data, { async: false });
}
async function writeRendered(templatePath, destPath, data) {
  const rendered = await renderTemplate(templatePath, data);
  await fs2.outputFile(destPath, rendered);
}
function resolveFeatureResources(features, answers) {
  const dependencies = /* @__PURE__ */ new Set();
  const devDependencies = /* @__PURE__ */ new Set();
  const files = [];
  const dockerServices = {};
  const injections = [];
  for (const feature of features) {
    if (feature.condition(answers)) {
      const deps = typeof feature.dependencies === "function" ? feature.dependencies(answers) : feature.dependencies || [];
      const devDeps = typeof feature.devDependencies === "function" ? feature.devDependencies(answers) : feature.devDependencies || [];
      deps.forEach((d) => dependencies.add(d));
      devDeps.forEach((d) => devDependencies.add(d));
      if (feature.files) {
        files.push(...feature.files(answers));
      }
      if (feature.dockerServices) {
        const services = typeof feature.dockerServices === "function" ? feature.dockerServices(answers) : feature.dockerServices;
        Object.assign(dockerServices, services);
      }
      if (feature.injection) {
        const importPath = typeof feature.injection.importPath === "function" ? feature.injection.importPath(answers) : feature.injection.importPath;
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
    injections
  };
}
async function generateProject(answers) {
  const targetDir = path3.join(process.cwd(), answers.projectName);
  const spinner = ora("Scaffolding base NestJS project via @nestjs/cli...").start();
  try {
    const nestArgs = [
      "--yes",
      "@nestjs/cli",
      "new",
      answers.projectName,
      "--package-manager",
      answers.packageManager,
      "--skip-git",
      "--strict"
    ];
    if (answers.skipInstall) {
      nestArgs.push("--skip-install");
    }
    await safeExec("npx", nestArgs);
    spinner.succeed(`Base project created at ${chalk.cyan(`./${answers.projectName}`)}`);
  } catch (err) {
    spinner.fail("Failed to scaffold base project.");
    if (fs2.existsSync(targetDir)) {
      await fs2.remove(targetDir);
    }
    throw err;
  }
  const resources = resolveFeatureResources(FEATURES, answers);
  if (answers.skipInstall) {
    spinner.info("Skipping package installation as requested.");
  } else {
    spinner.start(`Installing ${resources.dependencies.length} additional packages...`);
    try {
      if (resources.dependencies.length > 0) {
        const cmd = answers.packageManager === "npm" ? "install" : "add";
        await safeExec(answers.packageManager, [cmd, ...resources.dependencies], { cwd: targetDir });
      }
      if (resources.devDependencies.length > 0) {
        const cmd = answers.packageManager === "npm" ? "install" : "add";
        const devFlag = answers.packageManager === "npm" ? "-D" : "--dev";
        await safeExec(answers.packageManager, [cmd, devFlag, ...resources.devDependencies], { cwd: targetDir });
      }
      spinner.succeed("Additional packages installed.");
    } catch (err) {
      spinner.warn("Some packages failed to install. You may need to install them manually.");
      console.error(err);
    }
  }
  spinner.start("Generating and injecting custom modules...");
  const tplData = { ...answers };
  await Promise.all(resources.files.map(async (file) => {
    const fullSrcPath = path3.join(TEMPLATES_DIR, file.src);
    const fullDestPath = path3.join(targetDir, file.dest);
    if (file.type === "render") {
      await writeRendered(fullSrcPath, fullDestPath, tplData);
    } else {
      await fs2.ensureDir(path3.dirname(fullDestPath));
      await fs2.copy(fullSrcPath, fullDestPath);
    }
  }));
  await updateNestCliConfig(targetDir, answers);
  if (Object.keys(resources.dockerServices).length > 0) {
    await updateDockerCompose(targetDir, resources.dockerServices);
  }
  for (const injection of resources.injections) {
    await injectModuleToAppModule(targetDir, injection);
  }
  await updatePackageJsonScripts(targetDir);
  spinner.succeed("Modules injected successfully.");
  console.log("");
  console.log(chalk.bold.green("\u2705 Scaffolding complete!"));
  console.log("");
  console.log(chalk.bold("\u{1F4C1} Project structure:"));
  console.log(chalk.cyan(`  cd ${answers.projectName}`));
  console.log(chalk.cyan("  cp .env.example .env"));
  console.log(chalk.cyan(`  ${answers.packageManager} run start:dev`));
  console.log("");
}
async function addFeature(featureName, answers) {
  const targetDir = process.cwd();
  const packageJsonPath = path3.join(targetDir, PACKAGE_JSON_FILE);
  if (!fs2.existsSync(packageJsonPath) || !fs2.existsSync(path3.join(targetDir, APP_MODULE_FILE))) {
    throw new Error("This command must be run from the root of a NestJS project.");
  }
  const pkg = await fs2.readJson(packageJsonPath);
  const packageManager = fs2.existsSync(path3.join(targetDir, "yarn.lock")) ? "yarn" : fs2.existsSync(path3.join(targetDir, "pnpm-lock.yaml")) ? "pnpm" : "npm";
  const feature = FEATURES.find((f) => f.name.toLowerCase() === featureName.toLowerCase());
  if (!feature) {
    throw new Error(`Unknown feature: ${featureName}`);
  }
  if (feature.files) {
    const existingFiles = feature.files(answers).filter((f) => f.type !== "copy").map((f) => path3.join(targetDir, f.dest)).filter((p) => fs2.existsSync(p));
    if (existingFiles.length > 0) {
      const relPaths = existingFiles.map((p) => path3.relative(targetDir, p)).join(", ");
      throw new Error(
        `Feature "${featureName}" appears to already be installed.
  Existing files detected: ${relPaths}
  Remove them first if you want to re-scaffold this feature.`
      );
    }
  }
  const spinner = ora(`Adding feature ${chalk.cyan(feature.name)}...`).start();
  const resources = resolveFeatureResources([feature], answers);
  try {
    if (resources.dependencies.length > 0) {
      spinner.text = `Installing dependencies for ${feature.name}...`;
      const cmd = packageManager === "npm" ? "install" : "add";
      await safeExec(packageManager, [cmd, ...resources.dependencies], { cwd: targetDir });
    }
    if (resources.devDependencies.length > 0) {
      spinner.text = `Installing devDependencies for ${feature.name}...`;
      const cmd = packageManager === "npm" ? "install" : "add";
      const devFlag = packageManager === "npm" ? "-D" : "--dev";
      await safeExec(packageManager, [cmd, devFlag, ...resources.devDependencies], { cwd: targetDir });
    }
    if (resources.files.length > 0) {
      spinner.text = `Generating files for ${feature.name}...`;
      const tplData = { ...answers, projectName: pkg.name };
      await Promise.all(resources.files.map(async (file) => {
        const fullSrcPath = path3.join(TEMPLATES_DIR, file.src);
        const fullDestPath = path3.join(targetDir, file.dest);
        if (file.type === "render") {
          await writeRendered(fullSrcPath, fullDestPath, tplData);
        } else {
          await fs2.ensureDir(path3.dirname(fullDestPath));
          await fs2.copy(fullSrcPath, fullDestPath);
        }
      }));
    }
    for (const injection of resources.injections) {
      spinner.text = `Injecting ${injection.moduleName} into app.module.ts...`;
      await injectModuleToAppModule(targetDir, injection);
    }
    await updateNestCliConfig(targetDir, answers);
    await updatePackageJsonScripts(targetDir);
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
async function updateNestCliConfig(targetDir, answers) {
  const configPath = path3.join(targetDir, NEST_CLI_CONFIG_FILE);
  if (!fs2.existsSync(configPath)) return;
  try {
    const config = await fs2.readJson(configPath);
    config.compilerOptions = config.compilerOptions || {};
    const assets = new Set(config.compilerOptions.assets || []);
    if (answers.protocols?.includes(PROTOCOLS.GRPC)) {
      assets.add("**/*.proto");
    }
    if (assets.size > 0) {
      config.compilerOptions.assets = Array.from(assets);
      config.compilerOptions.watchAssets = true;
      await fs2.writeJson(configPath, config, { spaces: 2 });
    }
  } catch (err) {
    console.error(chalk.yellow("\n\u26A0\uFE0F  Could not update nest-cli.json assets. You may need to add them manually."));
  }
}
async function updatePackageJsonScripts(targetDir) {
  const pkgPath = path3.join(targetDir, PACKAGE_JSON_FILE);
  if (!fs2.existsSync(pkgPath)) return;
  try {
    const pkg = await fs2.readJson(pkgPath);
    pkg.scripts = pkg.scripts || {};
    if (pkg.scripts["test:e2e"]) {
      pkg.scripts["test:e2e"] = "jest --config ./test/jest-e2e.json --runInBand --forceExit --detectOpenHandles";
    }
    await fs2.writeJson(pkgPath, pkg, { spaces: 2 });
  } catch (err) {
    console.error(chalk.yellow("\n\u26A0\uFE0F  Could not update package.json scripts."));
  }
}

export {
  generateProject,
  addFeature
};
