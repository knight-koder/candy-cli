#!/usr/bin/env node
#!/usr/bin/env node
import {
  runAddPrompts,
  runPrompts
} from "./chunk-3BVZWNEQ.js";

// src/index.ts
import { Command } from "commander";

// src/commands/init.ts
import chalk from "chalk";
function registerInitCommand(program2) {
  program2.command("init").description("Initialize a new NestJS microservice interactively").argument("[project-name]", "Name of the project to create").action(async (projectName) => {
    console.log(chalk.blue.bold("\n\u{1F680} Welcome to Candy CLI!\n"));
    try {
      const answers = await runPrompts(projectName);
      console.log(chalk.green("\n\u2713 Configuration complete. Starting generation..."));
      const { generateProject } = await import("./engine-BBR6EQXY.js");
      await generateProject(answers);
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

// src/constants.ts
var FEATURE_NAMES = [
  "REST",
  "GraphQL",
  "gRPC",
  "WebSockets",
  "Kafka",
  "RabbitMQ",
  "BullMQ",
  "Redis",
  "Winston Logger",
  "Pino Logger",
  "Morgan",
  "OpenTelemetry",
  "Prometheus",
  "Swagger",
  "Opossum",
  "Fastify"
];
var FEATURE_HELP = FEATURE_NAMES.map((f) => `
  - ${f}`).join("");

// src/commands/add.ts
function registerAddCommand(program2) {
  program2.command("add").description(`Add a new feature to an existing project.

Available features:${FEATURE_HELP}`).action(async () => {
    console.log(chalk2.blue.bold("\n\u{1F527} Adding a new feature to your microservice...\n"));
    try {
      const { FEATURES } = await import("./features-2V4COZ32.js");
      const featureList = FEATURES.filter((f) => f.name !== "Base" && f.name !== "Microservices Base").map((f) => f.name);
      const { addFeature } = await import("./engine-BBR6EQXY.js");
      const { feature, dlqAndRetries } = await runAddPrompts(featureList);
      const answers = {
        projectName: "",
        packageManager: "npm",
        messagingQueue: ["Kafka", "RabbitMQ", "BullMQ"].includes(feature),
        queueType: ["Kafka", "RabbitMQ", "BullMQ"].includes(feature) ? feature : void 0,
        redisCache: feature === "Redis",
        logger: feature === "Winston Logger" ? "Winston" : feature === "Pino Logger" ? "Pino" : "None",
        observability: feature === "OpenTelemetry" ? "OpenTelemetry" : feature === "Prometheus" ? "Prometheus" : "None",
        opossum: feature === "Opossum",
        dlqAndRetries,
        protocols: feature === "GraphQL" ? ["GraphQL"] : feature === "gRPC" ? ["gRPC"] : [],
        apiDocs: feature === "Swagger"
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
var program = new Command();
program.name("candy-cli").description("A professional CLI to scaffold and extend scalable NestJS microservices").version("1.0.0");
registerInitCommand(program);
registerAddCommand(program);
program.parse();
