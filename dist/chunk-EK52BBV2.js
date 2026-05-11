#!/usr/bin/env node
import {
  FEATURES
} from "./chunk-YTOAFPNB.js";

// src/generator/ast-utils.ts
import { Project, QuoteKind, SyntaxKind } from "ts-morph";
import path from "path";
async function injectModuleToAppModule(projectDir, injection) {
  const project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single
    }
  });
  const appModulePath = path.join(projectDir, "src/app.module.ts");
  const sourceFile = project.addSourceFileAtPath(appModulePath);
  const classDeclaration = sourceFile.getClass("AppModule");
  if (!classDeclaration) {
    throw new Error("Could not find AppModule class in src/app.module.ts");
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
import { exec } from "child_process";
import { promisify } from "util";
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
  const composePath = path2.join(targetDir, "docker-compose.yml");
  let composeObj = { version: "3.8", services: {} };
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
  const yamlStr = yaml.stringify(composeObj);
  await fs.outputFile(composePath, yamlStr);
}

// src/generator/engine.ts
var execAsync = promisify(exec);
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
function findTemplatesDir() {
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
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
async function generateProject(answers) {
  const targetDir = path3.join(process.cwd(), answers.projectName);
  const spinner = ora("Scaffolding base NestJS project via @nestjs/cli...").start();
  try {
    await execAsync(
      `npx --yes @nestjs/cli new ${answers.projectName} --package-manager ${answers.packageManager} --skip-git --strict`
    );
    spinner.succeed(`Base project created at ${chalk.cyan(`./${answers.projectName}`)}`);
  } catch (err) {
    spinner.fail("Failed to scaffold base project.");
    throw err;
  }
  const dependencies = /* @__PURE__ */ new Set();
  const devDependencies = /* @__PURE__ */ new Set();
  const injections = [];
  const dockerServices = {};
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
  spinner.start(`Installing ${dependencies.size} additional packages...`);
  try {
    const installCmd = answers.packageManager === "npm" ? "npm install" : `${answers.packageManager} add`;
    if (dependencies.size > 0) {
      await execAsync(`${installCmd} ${Array.from(dependencies).join(" ")}`, { cwd: targetDir });
    }
    if (devDependencies.size > 0) {
      const devCmd = answers.packageManager === "npm" ? "npm install -D" : `${answers.packageManager} add -D`;
      await execAsync(`${devCmd} ${Array.from(devDependencies).join(" ")}`, { cwd: targetDir });
    }
    spinner.succeed("Additional packages installed.");
  } catch (err) {
    spinner.warn("Some packages failed to install. You may need to install them manually.");
    console.error(err);
  }
  spinner.start("Generating and injecting custom modules...");
  const tplData = { ...answers };
  for (const injection of injections) {
    const fullSrcPath = path3.join(TEMPLATES_DIR, injection.src);
    const fullDestPath = path3.join(targetDir, injection.dest);
    if (injection.type === "render") {
      await writeRendered(fullSrcPath, fullDestPath, tplData);
    } else {
      await fs2.ensureDir(path3.dirname(fullDestPath));
      await fs2.copy(fullSrcPath, fullDestPath);
    }
  }
  await updateNestCliConfig(targetDir, answers);
  if (Object.keys(dockerServices).length > 0) {
    await updateDockerCompose(targetDir, dockerServices);
  }
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
  const packageJsonPath = path3.join(targetDir, "package.json");
  if (!fs2.existsSync(packageJsonPath) || !fs2.existsSync(path3.join(targetDir, "src/app.module.ts"))) {
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
  const deps = feature.dependencies || [];
  const devDeps = feature.devDependencies || [];
  if (deps.length > 0) {
    spinner.text = `Installing dependencies for ${feature.name}...`;
    const installCmd = packageManager === "npm" ? "npm install" : `${packageManager} add`;
    await execAsync(`${installCmd} ${deps.join(" ")}`, { cwd: targetDir });
  }
  if (devDeps.length > 0) {
    spinner.text = `Installing devDependencies for ${feature.name}...`;
    const devCmd = packageManager === "npm" ? "npm install -D" : `${packageManager} add -D`;
    await execAsync(`${devCmd} ${devDeps.join(" ")}`, { cwd: targetDir });
  }
  if (feature.files) {
    spinner.text = `Generating files for ${feature.name}...`;
    const injections = feature.files(answers);
    const tplData = { ...answers, projectName: pkg.name };
    for (const injection of injections) {
      const fullSrcPath = path3.join(TEMPLATES_DIR, injection.src);
      const fullDestPath = path3.join(targetDir, injection.dest);
      if (injection.type === "render") {
        await writeRendered(fullSrcPath, fullDestPath, tplData);
      } else {
        await fs2.ensureDir(path3.dirname(fullDestPath));
        await fs2.copy(fullSrcPath, fullDestPath);
      }
    }
  }
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
async function updateNestCliConfig(targetDir, answers) {
  const configPath = path3.join(targetDir, "nest-cli.json");
  if (!fs2.existsSync(configPath)) return;
  try {
    const config = await fs2.readJson(configPath);
    config.compilerOptions = config.compilerOptions || {};
    const assets = new Set(config.compilerOptions.assets || []);
    if (answers.protocols?.includes("gRPC")) {
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

export {
  generateProject,
  addFeature
};
