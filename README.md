# 🍬 Candy CLI

> Production-grade, interactive CLI to scaffold and extend scalable NestJS microservices — batteries included.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

## Why Candy CLI?

Setting up a production-ready NestJS microservice from scratch takes hours. Candy CLI does it in under 120 seconds — wiring up your chosen protocols, message queues, caching layer, logging, observability, and Docker Compose configuration automatically through AST manipulation.

No boilerplate copy-pasting. No manual `app.module.ts` wiring. No forgotten Dockerfile.

---

## Installation

### From GitHub (Private)

```bash
npm install -g git+https://github.com/YourUsername/candy-cli.git
```

### From NPM (Public — once released)

```bash
npm install -g candy-cli
```

---

## Commands

### `candy-cli init [project-name]`

Interactively scaffold a brand-new NestJS microservice.

```bash
candy-cli init my-payment-service
```

**What it does:**
1. Runs `@nestjs/cli new` to create a clean base project
2. Installs all selected packages
3. Generates feature-specific modules from production-grade templates
4. Injects each module into `app.module.ts` via AST — no text manipulation
5. Generates a `docker-compose.yml` pre-configured for your chosen infrastructure
6. Generates a multi-stage `Dockerfile` for production deployment

---

### `candy-cli add`

Add a new feature to an **existing** NestJS project interactively.

```bash
cd my-existing-service
candy-cli add
```

This command will:
- Detect your project's package manager (npm / yarn / pnpm) automatically
- Install required packages
- Generate the necessary files
- Inject the new module into `app.module.ts` via AST
- **Update `docker-compose.yml`** if the feature requires infrastructure (e.g., Redis, Kafka)

---

## What Gets Generated

| Category | Options |
|---|---|
| **HTTP Adapter** | Express (default), Fastify |
| **Protocols** | REST, GraphQL, gRPC, WebSockets |
| **Message Queue** | Kafka, RabbitMQ, BullMQ |
| **Caching** | Redis (`@nestjs/cache-manager`) |
| **Logger** | Winston, Pino, Morgan |
| **Observability** | OpenTelemetry + Jaeger, Prometheus |
| **API Docs** | Swagger (`@nestjs/swagger`) |
| **Resiliency** | Opossum circuit breaker, DLQ & retries |
| **Infrastructure** | Auto-generated `docker-compose.yml` |
| **Deployment** | Multi-stage, non-root `Dockerfile` |

---

## Generated Project Structure

```
my-payment-service/
├── src/
│   ├── main.ts                       # Bootstraps app with chosen HTTP adapter
│   ├── app.module.ts                 # Root module (auto-wired by Candy CLI)
│   ├── app.controller.ts             # (REST) Sample health endpoint
│   ├── tracing.ts                    # (OpenTelemetry) SDK bootstrap
│   ├── graphql/
│   │   ├── graphql.module.ts
│   │   └── app.resolver.ts
│   ├── grpc/
│   │   ├── grpc.module.ts
│   │   └── hero/hero.proto
│   ├── kafka/
│   │   ├── kafka.module.ts
│   │   └── kafka.consumer.ts         # Includes DLQ consumer if selected
│   ├── rabbitmq/
│   │   ├── rabbitmq.module.ts
│   │   └── rabbitmq.consumer.ts      # nack → DLX dead letter exchange
│   ├── bullmq/
│   │   ├── bullmq.module.ts          # 3 retries with exponential backoff
│   │   └── bullmq.processor.ts
│   ├── redis/
│   │   └── redis.module.ts
│   ├── logger/
│   │   └── logger.module.ts          # Winston or Pino
│   ├── observability/
│   │   └── prometheus.module.ts
│   └── resiliency/
│       ├── resiliency.module.ts
│       └── circuit-breaker.service.ts
├── docker-compose.yml                # Pre-configured for your chosen stack
├── .env.example                      # All environment variables documented
├── Dockerfile                        # Multi-stage, non-root production image
└── package.json
```

---

## Requirements

- Node.js >= 18
- npm / yarn / pnpm
- Docker (optional, for `docker-compose up`)

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## Security

Please see [SECURITY.md](./SECURITY.md) for our responsible disclosure policy.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a history of notable changes.

## License

[MIT](./LICENSE) © Ashish Kushwaha
