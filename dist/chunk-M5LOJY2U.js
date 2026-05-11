#!/usr/bin/env node

// src/prompts/index.ts
import { input, select, confirm, checkbox } from "@inquirer/prompts";
async function runPrompts(initialProjectName) {
  const projectName = initialProjectName || await input({
    message: "What is the name of your project?",
    default: "my-microservice",
    validate: (val) => val ? true : "Project name cannot be empty"
  });
  const packageManager = await select({
    message: "Which package manager do you want to use? (Use arrow keys)",
    choices: [
      { value: "npm", name: "npm" },
      { value: "yarn", name: "yarn" },
      { value: "pnpm", name: "pnpm" }
    ],
    default: "npm"
  });
  const protocols = await checkbox({
    message: "Select the communication protocols to support: (Space to select, Enter to confirm)",
    choices: [
      { value: "REST", name: "REST", checked: true },
      { value: "GraphQL", name: "GraphQL" },
      { value: "gRPC", name: "gRPC" },
      { value: "WebSockets", name: "WebSockets" }
    ],
    validate: (arr) => arr.length > 0 ? true : "You must select at least one protocol"
  });
  let httpAdapter = void 0;
  if (protocols.includes("REST") || protocols.includes("GraphQL") || protocols.includes("WebSockets")) {
    httpAdapter = await select({
      message: "Which HTTP adapter do you want to use? (Use arrow keys)",
      choices: [
        { value: "Express", name: "Express (Recommended for compatibility)" },
        { value: "Fastify", name: "Fastify (High performance)" }
      ],
      default: "Express"
    });
  }
  const messagingQueue = await confirm({
    message: "Do you want to configure an asynchronous messaging queue?",
    default: false
  });
  let queueType = void 0;
  let dlqAndRetries = false;
  if (messagingQueue) {
    queueType = await select({
      message: "Which messaging queue do you want to use? (Use arrow keys)",
      choices: [
        { value: "Kafka", name: "Kafka" },
        { value: "RabbitMQ", name: "RabbitMQ" },
        { value: "BullMQ", name: "BullMQ" }
      ],
      default: "Kafka"
    });
    dlqAndRetries = await confirm({
      message: "Do you want to configure Dead Letter Queue (DLQ) and Retries for your Message Queue?",
      default: true
    });
  }
  const redisCache = await confirm({
    message: "Do you want to include Redis for caching?",
    default: false
  });
  const logger = await select({
    message: "Which logger do you want to configure?",
    choices: [
      { value: "Winston", name: "Winston" },
      { value: "Pino", name: "Pino" },
      { value: "Morgan", name: "Morgan (HTTP only)" },
      { value: "None", name: "None" }
    ],
    default: "Winston"
  });
  const observability = await select({
    message: "Which tracing & metrics solution do you want?",
    choices: [
      { value: "OpenTelemetry", name: "OpenTelemetry" },
      { value: "Prometheus", name: "Prometheus" },
      { value: "None", name: "None" }
    ],
    default: "OpenTelemetry"
  });
  let apiDocs = false;
  if (protocols.includes("REST")) {
    apiDocs = await confirm({
      message: "Do you want to generate API documentation (Swagger)?",
      default: true
    });
  }
  const opossum = await confirm({
    message: "Do you want to include a Circuit Breaker (Opossum) for synchronous outbound HTTP/gRPC calls?",
    default: false
  });
  return {
    projectName,
    packageManager,
    protocols,
    httpAdapter,
    messagingQueue,
    queueType,
    redisCache,
    logger,
    observability,
    apiDocs,
    opossum,
    dlqAndRetries
  };
}
async function runAddPrompts(availableFeatures) {
  const feature = await select({
    message: "Select the feature you want to add to your microservice: (Use arrow keys)",
    choices: availableFeatures.map((f) => ({ value: f, name: f }))
  });
  let dlqAndRetries = false;
  if (["Kafka", "RabbitMQ", "BullMQ"].includes(feature)) {
    dlqAndRetries = await confirm({
      message: "Configure Dead Letter Queue (DLQ) and Retries for this queue?",
      default: true
    });
  }
  return { feature, dlqAndRetries };
}

export {
  runPrompts,
  runAddPrompts
};
