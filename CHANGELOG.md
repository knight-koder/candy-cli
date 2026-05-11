# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-12

### Added
- `candy-nest-cli init` — interactive scaffolding for production-grade NestJS microservices
- `candy-nest-cli add` — add individual features to an existing project at any time
- Support for REST, GraphQL, gRPC, WebSockets communication protocols
- Kafka, RabbitMQ, and BullMQ messaging queues with DLQ support
- Redis caching via `@nestjs/cache-manager`
- Winston, Pino, and Morgan logging integrations
- OpenTelemetry distributed tracing with Jaeger
- Prometheus metrics module
- Swagger API documentation
- Opossum circuit breaker and resiliency module
- Dynamic `docker-compose.yml` generation based on selected infrastructure
- Multi-stage production `Dockerfile` generation
- AST-based `app.module.ts` injection (zero manual wiring)
- Comprehensive unit test suite (42 tests)
- Modular, extensible feature registry (`src/features/`)
