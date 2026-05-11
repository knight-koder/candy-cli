#!/usr/bin/env node

// src/prompts/index.ts
import inquirer from "inquirer";
async function runPrompts(initialProjectName) {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What is the name of your project?",
      default: initialProjectName || "my-microservice",
      validate: (input) => input ? true : "Project name cannot be empty",
      when: !initialProjectName
    },
    {
      type: "list",
      name: "packageManager",
      message: "Which package manager do you want to use?",
      choices: ["npm", "yarn", "pnpm"],
      default: "npm"
    },
    {
      type: "checkbox",
      name: "protocols",
      message: "Select the communication protocols to support:",
      choices: ["REST", "GraphQL", "gRPC", "WebSockets"],
      default: ["REST"],
      validate: (input) => input.length > 0 ? true : "You must select at least one protocol"
    },
    {
      type: "list",
      name: "httpAdapter",
      message: "Which HTTP adapter do you want to use?",
      choices: ["Express", "Fastify"],
      default: "Express",
      when: (answers2) => (answers2.protocols || []).includes("REST") || (answers2.protocols || []).includes("GraphQL") || (answers2.protocols || []).includes("WebSockets")
    },
    {
      type: "confirm",
      name: "messagingQueue",
      message: "Do you want to configure an asynchronous messaging queue?",
      default: false
    },
    {
      type: "list",
      name: "queueType",
      message: "Which messaging queue do you want to use?",
      choices: ["Kafka", "RabbitMQ", "BullMQ"],
      default: "Kafka",
      when: (answers2) => answers2.messagingQueue
    },
    {
      type: "confirm",
      name: "redisCache",
      message: "Do you want to include Redis for caching?",
      default: false
    },
    {
      type: "list",
      name: "logger",
      message: "Which logger do you want to configure?",
      choices: ["Winston", "Pino", "Morgan", "None"],
      default: "Winston"
    },
    {
      type: "list",
      name: "observability",
      message: "Which tracing & metrics solution do you want?",
      choices: ["OpenTelemetry", "Prometheus", "None"],
      default: "OpenTelemetry"
    },
    {
      type: "confirm",
      name: "apiDocs",
      message: "Do you want to generate API documentation (Swagger)?",
      default: true,
      when: (answers2) => (answers2.protocols || []).includes("REST")
    },
    {
      type: "confirm",
      name: "opossum",
      message: "Do you want to include a Circuit Breaker (Opossum) for synchronous outbound HTTP/gRPC calls?",
      default: false
    },
    {
      type: "confirm",
      name: "dlqAndRetries",
      message: "Do you want to configure Dead Letter Queue (DLQ) and Retries for your Message Queue?",
      default: true,
      when: (answers2) => answers2.messagingQueue
    }
  ]);
  return {
    ...answers,
    projectName: initialProjectName || answers.projectName
  };
}
async function runAddPrompts(availableFeatures) {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "feature",
      message: "Select the feature you want to add to your microservice:",
      choices: availableFeatures
    },
    {
      type: "confirm",
      name: "dlqAndRetries",
      message: "Configure Dead Letter Queue (DLQ) and Retries for this queue?",
      default: true,
      when: (answers2) => ["Kafka", "RabbitMQ", "BullMQ"].includes(answers2.feature || "")
    }
  ]);
  return answers;
}

export {
  runPrompts,
  runAddPrompts
};
