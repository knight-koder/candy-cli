#!/usr/bin/env node
import {
  runAddPrompts
} from "./chunk-5C54PEVZ.js";
import {
  CLI_FEATURE_LIST,
  FEATURE_NAMES,
  ORMS,
  isDatabaseFeature,
  isMessagingFeature,
  isProtocolFeature,
  mapFeatureToLogger,
  mapFeatureToObservability
} from "./chunk-VJ3SJRPV.js";

// src/index.ts
import { Command } from "commander";

// src/commands/init.ts
import chalk from "chalk";
function registerInitCommand(program2) {
  program2.command("init").description("Initialize a new NestJS microservice interactively").argument("[project-name]", "Name of the project to create").option("-y, --yes", "Skip all prompts and use defaults (Standard Pack)").option("--all", "Enable ALL features and skip prompts (Kitchen Sink)").option("--skip-install", "Skip package installation").action(async (projectName, options) => {
    console.log(chalk.blue.bold("\n\u{1F680} Welcome to Candy CLI!\n"));
    try {
      const { runPrompts } = await import("./prompts-BUNFHI2Q.js");
      const answers = await runPrompts(projectName, {
        skipPrompts: !!options.yes || !!options.all,
        full: !!options.all
      });
      console.log(chalk.green("\n\u2713 Configuration complete. Starting generation..."));
      const { generateProject } = await import("./engine-SKV6PL2L.js");
      await generateProject({
        ...answers,
        skipInstall: !!options.skipInstall
      });
      console.log(chalk.green.bold("\n\u{1F389} Microservice scaffolded successfully!\n"));
    } catch (error) {
      console.error(chalk.red("\n\u274C An error occurred during scaffolding:"));
      console.error(error);
      process.exit(1);
    }
  });
}

// src/commands/add.ts
import chalk2 from "chalk";
function registerAddCommand(program2) {
  program2.command("add [featureName]").description(`Add a new feature to an existing project.

Available features:
${CLI_FEATURE_LIST.map((f) => `  - ${f}`).join("\n")}`).action(async (featureName) => {
    console.log(chalk2.blue.bold("\n\u{1F527} Adding a new feature to your microservice...\n"));
    try {
      const { FEATURES } = await import("./features-2PJHNMSB.js");
      const featureList = FEATURES.filter((f) => f.name !== FEATURE_NAMES.BASE && f.name !== FEATURE_NAMES.MICROSERVICES_BASE).map((f) => f.name);
      const { addFeature } = await import("./engine-SKV6PL2L.js");
      let feature = featureName;
      let dlqAndRetries = true;
      if (!feature || !featureList.includes(feature)) {
        if (feature && !featureList.includes(feature)) {
          console.log(chalk2.yellow(`Warning: Feature "${feature}" is not recognized. Please select from the list.`));
        }
        const promptResult = await runAddPrompts(featureList);
        feature = promptResult.feature;
        dlqAndRetries = promptResult.dlqAndRetries;
      } else if (isMessagingFeature(feature)) {
        const { confirm } = await import("@inquirer/prompts");
        dlqAndRetries = await confirm({
          message: `Configure Dead Letter Queue (DLQ) and Retries for ${feature}?`,
          default: true
        });
      }
      let postgresOrm;
      let mysqlOrm;
      if (feature === FEATURE_NAMES.POSTGRESQL || feature === FEATURE_NAMES.MYSQL) {
        const { select } = await import("@inquirer/prompts");
        const ormChoice = await select({
          message: `Which ORM for ${feature}? (Use arrow keys)`,
          choices: [
            { value: ORMS.TYPEORM, name: "TypeORM (decorator-based, NestJS-native)" },
            { value: ORMS.PRISMA, name: "Prisma  (schema-first, type-safe client)" }
          ],
          default: ORMS.TYPEORM
        });
        if (feature === FEATURE_NAMES.POSTGRESQL) postgresOrm = ormChoice;
        if (feature === FEATURE_NAMES.MYSQL) mysqlOrm = ormChoice;
      }
      const isMessaging = isMessagingFeature(feature);
      const isDatabase = isDatabaseFeature(feature);
      const isProtocol = isProtocolFeature(feature);
      const answers = {
        projectName: "",
        packageManager: "npm",
        messagingQueue: isMessaging,
        queueType: isMessaging ? feature : void 0,
        redisCache: feature === FEATURE_NAMES.REDIS,
        database: isDatabase,
        databases: isDatabase ? [feature] : [],
        postgresOrm,
        mysqlOrm,
        logger: mapFeatureToLogger(feature),
        observability: mapFeatureToObservability(feature),
        opossum: feature === FEATURE_NAMES.OPOSSUM,
        dlqAndRetries,
        protocols: isProtocol ? [feature] : [],
        apiDocs: feature === FEATURE_NAMES.SWAGGER
      };
      await addFeature(feature, answers);
      console.log(chalk2.green.bold(`
\u{1F389} Feature "${feature}" added successfully!
`));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk2.red("\n\u274C An error occurred while adding the feature:"));
      console.error(errorMessage);
      process.exit(1);
    }
  });
}

// src/index.ts
import { createRequire } from "module";
var require2 = createRequire(import.meta.url);
var pkg = require2("../package.json");
var MIN_NODE_VERSION = 18;
var currentMajorVersion = parseInt(process.versions.node.split(".")[0]);
if (currentMajorVersion < MIN_NODE_VERSION) {
  console.error(`Error: candy-nest-cli requires Node.js version ${MIN_NODE_VERSION} or higher. Current version: ${process.versions.node}`);
  process.exit(1);
}
var program = new Command();
program.name("candy-nest-cli").description("A professional CLI to scaffold and extend scalable NestJS microservices").version(pkg.version);
registerInitCommand(program);
registerAddCommand(program);
program.parse();
