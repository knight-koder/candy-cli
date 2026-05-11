#!/usr/bin/env node

// src/features/base.ts
var baseFeature = {
  name: "Base",
  condition: () => true,
  dependencies: ["@nestjs/config"],
  files: () => [
    { src: "main.ts.ejs", dest: "src/main.ts", type: "render" },
    { src: "app.module.ts.ejs", dest: "src/app.module.ts", type: "render" },
    { src: ".env.example.ejs", dest: ".env.example", type: "render" },
    { src: "Dockerfile.ejs", dest: "Dockerfile", type: "render" }
  ]
};
var fastifyFeature = {
  name: "Fastify",
  condition: (a) => a.httpAdapter === "Fastify",
  dependencies: ["@nestjs/platform-fastify"]
};

// src/features/protocols.ts
var restFeature = {
  name: "REST",
  condition: (a) => a.protocols.includes("REST"),
  files: () => [
    { src: "modules/rest/app.controller.ts.ejs", dest: "src/app.controller.ts", type: "render" }
  ]
};
var graphqlFeature = {
  name: "GraphQL",
  condition: (a) => a.protocols.includes("GraphQL"),
  dependencies: ["@nestjs/graphql", "@nestjs/apollo", "@apollo/server", "graphql", "@as-integrations/express5"],
  files: () => [
    { src: "modules/graphql/app.resolver.ts.ejs", dest: "src/graphql/app.resolver.ts", type: "render" },
    { src: "modules/graphql/graphql.module.ts.ejs", dest: "src/graphql/graphql.module.ts", type: "render" },
    { src: "modules/graphql/app.resolver.spec.ts.ejs", dest: "src/graphql/app.resolver.spec.ts", type: "render" }
  ],
  injection: { moduleName: "GraphqlModule", importPath: "./graphql/graphql.module" }
};
var grpcFeature = {
  name: "gRPC",
  condition: (a) => a.protocols.includes("gRPC"),
  dependencies: ["@nestjs/microservices", "@grpc/grpc-js", "@grpc/proto-loader", "rxjs"],
  devDependencies: ["@types/google-protobuf"],
  files: () => [
    { src: "modules/grpc/grpc.module.ts.ejs", dest: "src/grpc/grpc.module.ts", type: "render" },
    { src: "modules/grpc/hero.proto.ejs", dest: "src/grpc/hero/hero.proto", type: "render" },
    { src: "modules/grpc/grpc.controller.ts.ejs", dest: "src/grpc/grpc.controller.ts", type: "render" },
    { src: "modules/grpc/grpc.controller.spec.ts.ejs", dest: "src/grpc/grpc.controller.spec.ts", type: "render" }
  ],
  injection: { moduleName: "GrpcClientModule", importPath: "./grpc/grpc.module" }
};
var websocketsFeature = {
  name: "WebSockets",
  condition: (a) => a.protocols.includes("WebSockets"),
  dependencies: ["@nestjs/websockets", "@nestjs/platform-socket.io", "socket.io"],
  files: () => [
    { src: "modules/websockets/app.gateway.ts.ejs", dest: "src/websockets/app.gateway.ts", type: "render" },
    { src: "modules/websockets/websockets.module.ts.ejs", dest: "src/websockets/websockets.module.ts", type: "render" },
    { src: "modules/websockets/app.gateway.spec.ts.ejs", dest: "src/websockets/app.gateway.spec.ts", type: "render" }
  ],
  injection: { moduleName: "WebSocketsModule", importPath: "./websockets/websockets.module" }
};

// src/features/messaging.ts
var microservicesBaseFeature = {
  name: "Microservices Base",
  condition: (a) => a.messagingQueue || a.protocols.includes("gRPC"),
  dependencies: ["@nestjs/microservices"]
};
var kafkaFeature = {
  name: "Kafka",
  condition: (a) => a.messagingQueue && a.queueType === "Kafka",
  dependencies: ["kafkajs", "@nestjs/microservices", "rxjs"],
  files: (a) => [
    { src: "modules/kafka/kafka.module.ts.ejs", dest: "src/kafka/kafka.module.ts", type: "render" },
    {
      src: a.dlqAndRetries ? "modules/kafka/kafka.dlq.consumer.ts.ejs" : "modules/kafka/kafka.consumer.ts.ejs",
      dest: "src/kafka/kafka.consumer.ts",
      type: a.dlqAndRetries ? "render" : "copy"
    },
    { src: "modules/kafka/kafka.consumer.spec.ts.ejs", dest: "src/kafka/kafka.consumer.spec.ts", type: "render" },
    { src: "modules/kafka/kafka.producer.service.ts.ejs", dest: "src/kafka/kafka.producer.service.ts", type: "render" },
    { src: "modules/kafka/kafka.producer.service.spec.ts.ejs", dest: "src/kafka/kafka.producer.service.spec.ts", type: "render" }
  ],
  injection: { moduleName: "KafkaModule", importPath: "./kafka/kafka.module" },
  dockerServices: {
    kafka: {
      image: "apache/kafka:latest",
      ports: ["9092:9092"],
      environment: {
        KAFKA_NODE_ID: 1,
        KAFKA_PROCESS_ROLES: "broker,controller",
        KAFKA_LISTENERS: "PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093",
        KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://localhost:9092",
        KAFKA_CONTROLLER_LISTENER_NAMES: "CONTROLLER",
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT",
        KAFKA_CONTROLLER_QUORUM_VOTERS: "1@localhost:9093",
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1,
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1,
        KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      }
    },
    "kafka-init": {
      image: "apache/kafka:latest",
      depends_on: ["kafka"],
      command: "bash -c 'until /opt/kafka/bin/kafka-topics.sh --create --if-not-exists --topic <%= projectName %>.reply --bootstrap-server kafka:9092 --partitions 1 --replication-factor 1; do echo waiting for kafka; sleep 2; done'"
    }
  }
};
var rabbitmqFeature = {
  name: "RabbitMQ",
  condition: (a) => a.messagingQueue && a.queueType === "RabbitMQ",
  dependencies: ["amqplib", "amqp-connection-manager", "@nestjs/microservices", "rxjs"],
  files: (a) => [
    { src: "modules/rabbitmq/rabbitmq.module.ts.ejs", dest: "src/rabbitmq/rabbitmq.module.ts", type: "render" },
    { src: "modules/rabbitmq/rabbitmq.consumer.ts.ejs", dest: "src/rabbitmq/rabbitmq.consumer.ts", type: "render" },
    { src: "modules/rabbitmq/rabbitmq.consumer.spec.ts.ejs", dest: "src/rabbitmq/rabbitmq.consumer.spec.ts", type: "render" },
    { src: "modules/rabbitmq/rabbitmq.publisher.service.ts.ejs", dest: "src/rabbitmq/rabbitmq.publisher.service.ts", type: "render" },
    { src: "modules/rabbitmq/rabbitmq.publisher.service.spec.ts.ejs", dest: "src/rabbitmq/rabbitmq.publisher.service.spec.ts", type: "render" },
    ...a.dlqAndRetries ? [{ src: "modules/rabbitmq/rabbitmq.dlq.consumer.ts.ejs", dest: "src/rabbitmq/rabbitmq.dlq.consumer.ts", type: "render" }] : []
  ],
  injection: { moduleName: "RabbitMQModule", importPath: "./rabbitmq/rabbitmq.module" },
  dockerServices: {
    rabbitmq: {
      image: "rabbitmq:3-management",
      ports: ["5672:5672", "15672:15672"],
      environment: { RABBITMQ_DEFAULT_USER: "guest", RABBITMQ_DEFAULT_PASS: "guest" }
    }
  }
};
var bullmqFeature = {
  name: "BullMQ",
  condition: (a) => a.messagingQueue && a.queueType === "BullMQ",
  dependencies: ["@nestjs/bullmq", "bullmq", "@nestjs/schedule"],
  files: (a) => [
    { src: "modules/bullmq/bullmq.module.ts.ejs", dest: "src/bullmq/bullmq.module.ts", type: "render" },
    { src: "modules/bullmq/bullmq.processor.ts.ejs", dest: "src/bullmq/bullmq.processor.ts", type: "render" },
    { src: "modules/bullmq/bullmq.processor.spec.ts.ejs", dest: "src/bullmq/bullmq.processor.spec.ts", type: "render" },
    { src: "modules/bullmq/bullmq.producer.service.ts.ejs", dest: "src/bullmq/bullmq.producer.service.ts", type: "render" },
    { src: "modules/bullmq/bullmq.producer.service.spec.ts.ejs", dest: "src/bullmq/bullmq.producer.service.spec.ts", type: "render" },
    ...a.dlqAndRetries ? [
      { src: "modules/bullmq/bullmq.dlq.cron.ts.ejs", dest: "src/bullmq/bullmq.dlq.cron.ts", type: "render" },
      { src: "modules/bullmq/bullmq.dlq.cron.spec.ts.ejs", dest: "src/bullmq/bullmq.dlq.cron.spec.ts", type: "render" }
    ] : []
  ],
  injection: { moduleName: "BullMQModule", importPath: "./bullmq/bullmq.module" },
  dockerServices: {
    redis: { image: "redis:alpine", ports: ["6379:6379"] }
  }
};

// src/features/redis.ts
var redisFeature = {
  name: "Redis",
  condition: (a) => a.redisCache,
  dependencies: ["@nestjs/cache-manager", "cache-manager", "cache-manager-redis-store"],
  devDependencies: ["@types/cache-manager-redis-store"],
  files: () => [
    { src: "modules/redis/redis.module.ts.ejs", dest: "src/redis/redis.module.ts", type: "render" },
    { src: "modules/redis/redis.service.ts.ejs", dest: "src/redis/redis.service.ts", type: "render" },
    { src: "modules/redis/redis.service.spec.ts.ejs", dest: "src/redis/redis.service.spec.ts", type: "render" }
  ],
  injection: { moduleName: "RedisModule", importPath: "./redis/redis.module" },
  dockerServices: {
    redis: { image: "redis:alpine", ports: ["6379:6379"] }
  }
};

// src/features/logging.ts
var winstonFeature = {
  name: "Winston Logger",
  condition: (a) => a.logger === "Winston",
  dependencies: ["nest-winston", "winston"],
  files: () => [
    { src: "modules/logger/winston.module.ts.ejs", dest: "src/logger/logger.module.ts", type: "render" }
  ],
  injection: { moduleName: "LoggerModule", importPath: "./logger/logger.module" }
};
var pinoFeature = {
  name: "Pino Logger",
  condition: (a) => a.logger === "Pino",
  dependencies: ["nestjs-pino", "pino-http", "pino-pretty"],
  files: () => [
    { src: "modules/logger/pino.module.ts.ejs", dest: "src/logger/logger.module.ts", type: "render" }
  ],
  injection: { moduleName: "LoggerModule", importPath: "./logger/logger.module" }
};
var morganFeature = {
  name: "Morgan",
  condition: (a) => a.logger === "Morgan",
  dependencies: ["morgan"],
  devDependencies: ["@types/morgan"]
};

// src/features/observability.ts
var openTelemetryFeature = {
  name: "OpenTelemetry",
  condition: (a) => a.observability === "OpenTelemetry",
  dependencies: [
    "@opentelemetry/sdk-node@0.39.1",
    "@opentelemetry/api@1.4.1",
    "@opentelemetry/auto-instrumentations-node@0.37.0",
    "@opentelemetry/exporter-trace-otlp-http@0.39.1",
    "@opentelemetry/resources@1.13.0",
    "@opentelemetry/semantic-conventions@1.13.0"
  ],
  files: () => [
    { src: "modules/observability/tracing.ts.ejs", dest: "src/tracing.ts", type: "render" }
  ],
  dockerServices: {
    jaeger: {
      image: "jaegertracing/all-in-one:latest",
      ports: ["16686:16686", "4318:4318"]
    }
  }
};
var prometheusFeature = {
  name: "Prometheus",
  condition: (a) => a.observability === "Prometheus",
  dependencies: ["@willsoto/nestjs-prometheus", "prom-client"],
  files: () => [
    { src: "modules/observability/prometheus.module.ts.ejs", dest: "src/observability/prometheus.module.ts", type: "render" }
  ],
  injection: { moduleName: "MetricsModule", importPath: "./observability/prometheus.module" },
  dockerServices: {
    prometheus: {
      image: "prom/prometheus:latest",
      ports: ["9090:9090"]
    }
  }
};
var swaggerFeature = {
  name: "Swagger",
  condition: (a) => a.apiDocs,
  dependencies: ["@nestjs/swagger"]
};
var opossumFeature = {
  name: "Opossum",
  condition: (a) => a.opossum,
  dependencies: ["opossum"],
  devDependencies: ["@types/opossum"],
  files: () => [
    { src: "modules/resiliency/circuit-breaker.service.ts.ejs", dest: "src/resiliency/circuit-breaker.service.ts", type: "render" },
    { src: "modules/resiliency/circuit-breaker.service.spec.ts.ejs", dest: "src/resiliency/circuit-breaker.service.spec.ts", type: "render" },
    { src: "modules/resiliency/resiliency.module.ts.ejs", dest: "src/resiliency/resiliency.module.ts", type: "render" }
  ],
  injection: { moduleName: "ResiliencyModule", importPath: "./resiliency/resiliency.module" }
};

// src/features/index.ts
var FEATURES = [
  baseFeature,
  fastifyFeature,
  restFeature,
  graphqlFeature,
  grpcFeature,
  websocketsFeature,
  microservicesBaseFeature,
  kafkaFeature,
  rabbitmqFeature,
  bullmqFeature,
  redisFeature,
  winstonFeature,
  pinoFeature,
  morganFeature,
  openTelemetryFeature,
  prometheusFeature,
  swaggerFeature,
  opossumFeature
];

export {
  FEATURES
};
