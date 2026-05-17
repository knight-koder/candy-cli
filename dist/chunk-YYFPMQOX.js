#!/usr/bin/env node
import {
  ADAPTERS,
  APP_MODULE_FILE,
  DATABASES,
  DOCKERFILE_FILE,
  DOCKER_IMAGES,
  ENV_EXAMPLE_FILE,
  FEATURE_NAMES,
  LOGGERS,
  MAIN_TS_FILE,
  MESSAGING,
  OBSERVABILITY,
  ORMS,
  PATHS,
  PROTOCOLS,
  getRelativeImportPath
} from "./chunk-VJ3SJRPV.js";

// src/features/base.ts
var baseFeature = {
  name: FEATURE_NAMES.BASE,
  condition: () => true,
  dependencies: (a) => {
    const deps = [
      "@nestjs/config",
      "@nestjs/terminus",
      "@nestjs/axios",
      "joi",
      "@nestjs/throttler",
      "class-validator",
      "class-transformer",
      "@nestjs/microservices"
    ];
    if (a.redisCache || a.messagingQueue && a.queueType === "BullMQ") {
      deps.push("@nest-lab/throttler-storage-redis", "ioredis");
    }
    return deps;
  },
  files: () => [
    { src: "main.ts.ejs", dest: MAIN_TS_FILE, type: "render" },
    { src: "app.module.ts.ejs", dest: APP_MODULE_FILE, type: "render" },
    { src: ".env.example.ejs", dest: ENV_EXAMPLE_FILE, type: "render" },
    { src: "Dockerfile.ejs", dest: DOCKERFILE_FILE, type: "render" },
    { src: "modules/health/health.module.ts.ejs", dest: "src/health/health.module.ts", type: "render" },
    { src: "modules/health/health.controller.ts.ejs", dest: "src/health/health.controller.ts", type: "render" },
    { src: "modules/testing/regression.e2e-spec.ts.ejs", dest: "test/regression.e2e-spec.ts", type: "render" },
    { src: "modules/testing/jest-e2e.json.ejs", dest: "test/jest-e2e.json", type: "render" },
    { src: "README.md.ejs", dest: "README.md", type: "render" }
  ]
};
var fastifyFeature = {
  name: FEATURE_NAMES.FASTIFY,
  condition: (a) => a.httpAdapter === ADAPTERS.FASTIFY,
  dependencies: ["@nestjs/platform-fastify"]
};

// src/features/protocols.ts
var restFeature = {
  name: FEATURE_NAMES.REST,
  condition: (a) => a.protocols.includes(PROTOCOLS.REST),
  files: () => [
    { src: "modules/rest/app.controller.ts.ejs", dest: "src/app.controller.ts", type: "render" }
  ]
};
var graphqlFeature = {
  name: FEATURE_NAMES.GRAPHQL,
  condition: (a) => a.protocols.includes(PROTOCOLS.GRAPHQL),
  dependencies: ["@nestjs/graphql", "@nestjs/apollo", "@apollo/server", "graphql", "@as-integrations/express5"],
  files: () => [
    { src: "modules/graphql/app.resolver.ts.ejs", dest: `${PATHS.GRAPHQL}/app.resolver.ts`, type: "render" },
    { src: "modules/graphql/graphql.module.ts.ejs", dest: `${PATHS.GRAPHQL}/graphql.module.ts`, type: "render" },
    { src: "modules/graphql/app.resolver.spec.ts.ejs", dest: `${PATHS.GRAPHQL}/app.resolver.spec.ts`, type: "render" }
  ],
  injection: {
    moduleName: "GraphqlModule",
    importPath: () => `${getRelativeImportPath(PATHS.GRAPHQL)}/graphql.module`
  }
};
var grpcFeature = {
  name: FEATURE_NAMES.GRPC,
  condition: (a) => a.protocols.includes(PROTOCOLS.GRPC),
  dependencies: ["@nestjs/microservices", "@grpc/grpc-js", "@grpc/proto-loader", "rxjs"],
  devDependencies: ["@types/google-protobuf"],
  files: () => [
    { src: "modules/grpc/grpc.module.ts.ejs", dest: `${PATHS.GRPC}/grpc.module.ts`, type: "render" },
    { src: "modules/grpc/hero.proto.ejs", dest: `${PATHS.GRPC}/hero/hero.proto`, type: "render" },
    { src: "modules/grpc/grpc.controller.ts.ejs", dest: `${PATHS.GRPC}/grpc.controller.ts`, type: "render" },
    { src: "modules/grpc/grpc.controller.spec.ts.ejs", dest: `${PATHS.GRPC}/grpc.controller.spec.ts`, type: "render" }
  ],
  injection: {
    moduleName: "GrpcClientModule",
    importPath: () => `${getRelativeImportPath(PATHS.GRPC)}/grpc.module`
  }
};
var websocketsFeature = {
  name: FEATURE_NAMES.WEBSOCKETS,
  condition: (a) => a.protocols.includes(PROTOCOLS.WEBSOCKETS),
  dependencies: ["@nestjs/websockets", "@nestjs/platform-socket.io", "socket.io"],
  files: () => [
    { src: "modules/websockets/app.gateway.ts.ejs", dest: `${PATHS.WEBSOCKETS}/app.gateway.ts`, type: "render" },
    { src: "modules/websockets/websockets.module.ts.ejs", dest: `${PATHS.WEBSOCKETS}/websockets.module.ts`, type: "render" },
    { src: "modules/websockets/app.gateway.spec.ts.ejs", dest: `${PATHS.WEBSOCKETS}/app.gateway.spec.ts`, type: "render" }
  ],
  injection: {
    moduleName: "WebSocketsModule",
    importPath: () => `${getRelativeImportPath(PATHS.WEBSOCKETS)}/websockets.module`
  }
};

// src/features/infrastructure.ts
var getPostgresService = () => ({
  image: DOCKER_IMAGES.POSTGRES,
  ports: ["5432:5432"],
  environment: {
    POSTGRES_USER: "${POSTGRES_USER:-postgres}",
    POSTGRES_PASSWORD: "${POSTGRES_PASSWORD:-postgres}",
    POSTGRES_DB: "${POSTGRES_DB}"
  },
  volumes: ["postgres_data:/var/lib/postgresql/data"]
});
var getMysqlService = () => ({
  image: DOCKER_IMAGES.MYSQL,
  ports: ["3306:3306"],
  environment: {
    MYSQL_ROOT_PASSWORD: "${MYSQL_ROOT_PASSWORD:-root}",
    MYSQL_USER: "${MYSQL_USER:-app}",
    MYSQL_PASSWORD: "${MYSQL_PASSWORD:-app}",
    MYSQL_DATABASE: "${MYSQL_DB}"
  },
  volumes: ["mysql_data:/var/lib/mysql"]
});
var getMongoService = (a) => ({
  image: DOCKER_IMAGES.MONGODB,
  ports: ["27017:27017"],
  environment: {
    MONGO_INITDB_DATABASE: `\${MONGO_DB:-${a.projectName}}`
  },
  volumes: ["mongo_data:/data/db"]
});
var getRedisService = () => ({
  image: DOCKER_IMAGES.REDIS,
  ports: ["6379:6379"]
});
var getKafkaService = (a) => {
  const service = {
    image: DOCKER_IMAGES.KAFKA,
    ports: ["9092:9092"],
    environment: {
      KAFKA_NODE_ID: 1,
      KAFKA_PROCESS_ROLES: "broker,controller",
      KAFKA_LISTENERS: "PLAINTEXT://0.0.0.0:9092,INTERNAL://0.0.0.0:29092,CONTROLLER://0.0.0.0:9093",
      KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://localhost:9092,INTERNAL://kafka:29092",
      KAFKA_CONTROLLER_LISTENER_NAMES: "CONTROLLER",
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: "CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,INTERNAL:PLAINTEXT",
      KAFKA_CONTROLLER_QUORUM_VOTERS: "1@kafka:9093",
      KAFKA_INTER_BROKER_LISTENER_NAME: "INTERNAL",
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1,
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1,
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
    },
    healthcheck: {
      test: [
        "CMD-SHELL",
        "/opt/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092"
      ],
      interval: "10s",
      timeout: "5s",
      retries: 10,
      start_period: "15s"
    }
  };
  return service;
};
var getRabbitMQService = () => ({
  image: DOCKER_IMAGES.RABBITMQ,
  ports: ["5672:5672", "15672:15672"],
  environment: {
    RABBITMQ_DEFAULT_USER: "guest",
    RABBITMQ_DEFAULT_PASS: "guest"
  }
});
var getJaegerService = () => ({
  image: DOCKER_IMAGES.JAEGER,
  ports: ["16686:16686", "4318:4318"]
});
var getPrometheusService = () => ({
  image: DOCKER_IMAGES.PROMETHEUS,
  ports: ["9090:9090"]
});

// src/features/messaging.ts
var microservicesBaseFeature = {
  name: FEATURE_NAMES.MICROSERVICES_BASE,
  condition: (a) => a.messagingQueue || a.protocols.includes(PROTOCOLS.GRPC),
  dependencies: ["@nestjs/microservices"]
};
var kafkaFeature = {
  name: FEATURE_NAMES.KAFKA,
  condition: (a) => a.messagingQueue && a.queueType === MESSAGING.KAFKA,
  dependencies: ["kafkajs", "@nestjs/microservices", "rxjs"],
  files: (a) => [
    { src: "modules/kafka/kafka.module.ts.ejs", dest: `${PATHS.KAFKA}/kafka.module.ts`, type: "render" },
    {
      src: a.dlqAndRetries ? "modules/kafka/kafka.dlq.consumer.ts.ejs" : "modules/kafka/kafka.consumer.ts.ejs",
      dest: `${PATHS.KAFKA}/kafka.consumer.ts`,
      type: a.dlqAndRetries ? "render" : "copy"
    },
    { src: "modules/kafka/kafka.consumer.spec.ts.ejs", dest: `${PATHS.KAFKA}/kafka.consumer.spec.ts`, type: "render" },
    { src: "modules/kafka/kafka.producer.service.ts.ejs", dest: `${PATHS.KAFKA}/kafka.producer.service.ts`, type: "render" },
    { src: "modules/kafka/kafka.producer.service.spec.ts.ejs", dest: `${PATHS.KAFKA}/kafka.producer.service.spec.ts`, type: "render" }
  ],
  injection: {
    moduleName: "KafkaModule",
    importPath: () => `${getRelativeImportPath(PATHS.KAFKA)}/kafka.module`
  },
  dockerServices: (a) => ({
    kafka: getKafkaService(a)
  })
};
var rabbitmqFeature = {
  name: FEATURE_NAMES.RABBITMQ,
  condition: (a) => a.messagingQueue && a.queueType === MESSAGING.RABBITMQ,
  dependencies: ["amqplib", "amqp-connection-manager", "@nestjs/microservices", "rxjs"],
  files: (a) => [
    { src: "modules/rabbitmq/rabbitmq.module.ts.ejs", dest: `${PATHS.RABBITMQ}/rabbitmq.module.ts`, type: "render" },
    { src: "modules/rabbitmq/rabbitmq.consumer.ts.ejs", dest: `${PATHS.RABBITMQ}/rabbitmq.consumer.ts`, type: "render" },
    { src: "modules/rabbitmq/rabbitmq.consumer.spec.ts.ejs", dest: `${PATHS.RABBITMQ}/rabbitmq.consumer.spec.ts`, type: "render" },
    { src: "modules/rabbitmq/rabbitmq.publisher.service.ts.ejs", dest: `${PATHS.RABBITMQ}/rabbitmq.publisher.service.ts`, type: "render" },
    { src: "modules/rabbitmq/rabbitmq.publisher.service.spec.ts.ejs", dest: `${PATHS.RABBITMQ}/rabbitmq.publisher.service.spec.ts`, type: "render" },
    ...a.dlqAndRetries ? [{ src: "modules/rabbitmq/rabbitmq.dlq.consumer.ts.ejs", dest: `${PATHS.RABBITMQ}/rabbitmq.dlq.consumer.ts`, type: "render" }] : []
  ],
  injection: {
    moduleName: "RabbitMQModule",
    importPath: () => `${getRelativeImportPath(PATHS.RABBITMQ)}/rabbitmq.module`
  },
  dockerServices: () => ({ rabbitmq: getRabbitMQService() })
};
var bullmqFeature = {
  name: FEATURE_NAMES.BULLMQ,
  condition: (a) => a.messagingQueue && a.queueType === MESSAGING.BULLMQ,
  dependencies: ["@nestjs/bullmq", "bullmq", "@nestjs/schedule"],
  files: (a) => [
    { src: "modules/bullmq/bullmq.module.ts.ejs", dest: `${PATHS.BULLMQ}/bullmq.module.ts`, type: "render" },
    { src: "modules/bullmq/bullmq.processor.ts.ejs", dest: `${PATHS.BULLMQ}/bullmq.processor.ts`, type: "render" },
    { src: "modules/bullmq/bullmq.processor.spec.ts.ejs", dest: `${PATHS.BULLMQ}/bullmq.processor.spec.ts`, type: "render" },
    { src: "modules/bullmq/bullmq.producer.service.ts.ejs", dest: `${PATHS.BULLMQ}/bullmq.producer.service.ts`, type: "render" },
    { src: "modules/bullmq/bullmq.producer.service.spec.ts.ejs", dest: `${PATHS.BULLMQ}/bullmq.producer.service.spec.ts`, type: "render" },
    ...a.dlqAndRetries ? [
      { src: "modules/bullmq/bullmq.dlq.cron.ts.ejs", dest: `${PATHS.BULLMQ}/bullmq.dlq.cron.ts`, type: "render" },
      { src: "modules/bullmq/bullmq.dlq.cron.spec.ts.ejs", dest: `${PATHS.BULLMQ}/bullmq.dlq.cron.spec.ts`, type: "render" }
    ] : []
  ],
  injection: {
    moduleName: "BullMQModule",
    importPath: () => `${getRelativeImportPath(PATHS.BULLMQ)}/bullmq.module`
  },
  dockerServices: () => ({ redis: getRedisService() })
};

// src/features/redis.ts
var redisFeature = {
  name: FEATURE_NAMES.REDIS,
  condition: (a) => a.redisCache,
  dependencies: ["@nestjs/cache-manager", "cache-manager", "cache-manager-redis-store"],
  devDependencies: ["@types/cache-manager-redis-store"],
  files: () => [
    { src: "modules/redis/redis.module.ts.ejs", dest: `${PATHS.REDIS}/redis.module.ts`, type: "render" },
    { src: "modules/redis/redis.service.ts.ejs", dest: `${PATHS.REDIS}/redis.service.ts`, type: "render" },
    { src: "modules/redis/redis.service.spec.ts.ejs", dest: `${PATHS.REDIS}/redis.service.spec.ts`, type: "render" }
  ],
  injection: {
    moduleName: "RedisModule",
    importPath: () => `${getRelativeImportPath(PATHS.REDIS)}/redis.module`
  },
  dockerServices: {
    redis: getRedisService()
  }
};

// src/features/logging.ts
var winstonFeature = {
  name: FEATURE_NAMES.WINSTON,
  condition: (a) => a.logger === LOGGERS.WINSTON,
  dependencies: (a) => {
    const deps = ["nest-winston", "winston"];
    if (a.protocols.includes(PROTOCOLS.REST)) {
      deps.push("morgan");
    }
    return deps;
  },
  devDependencies: (a) => {
    return a.protocols.includes(PROTOCOLS.REST) ? ["@types/morgan"] : [];
  },
  files: () => [
    { src: "modules/logger/winston.module.ts.ejs", dest: `${PATHS.LOGGER}/logger.module.ts`, type: "render" }
  ],
  injection: {
    moduleName: "LoggerModule",
    importPath: () => `${getRelativeImportPath(PATHS.LOGGER)}/logger.module`
  }
};
var pinoFeature = {
  name: FEATURE_NAMES.PINO,
  condition: (a) => a.logger === LOGGERS.PINO,
  dependencies: (a) => {
    const deps = ["nestjs-pino", "pino", "pino-pretty"];
    if (a.protocols.includes(PROTOCOLS.REST)) {
      deps.push("pino-http");
    }
    return deps;
  },
  files: () => [
    { src: "modules/logger/pino.module.ts.ejs", dest: `${PATHS.LOGGER}/logger.module.ts`, type: "render" }
  ],
  injection: {
    moduleName: "LoggerModule",
    importPath: () => `${getRelativeImportPath(PATHS.LOGGER)}/logger.module`
  }
};

// src/features/observability.ts
var openTelemetryFeature = {
  name: FEATURE_NAMES.OPENTELEMETRY,
  condition: (a) => a.observability === OBSERVABILITY.OPENTELEMETRY,
  dependencies: (a) => {
    const deps = [
      "@opentelemetry/sdk-node@0.39.1",
      "@opentelemetry/api@1.4.1",
      "@opentelemetry/auto-instrumentations-node@0.37.0",
      "@opentelemetry/exporter-trace-otlp-http@0.39.1",
      "@opentelemetry/resources@1.13.0",
      "@opentelemetry/semantic-conventions@1.13.0"
    ];
    if (a.logger === LOGGERS.WINSTON) deps.push("@opentelemetry/instrumentation-winston");
    if (a.logger === LOGGERS.PINO) deps.push("@opentelemetry/instrumentation-pino");
    return deps;
  },
  files: () => [
    { src: "modules/observability/tracing.ts.ejs", dest: "src/tracing.ts", type: "render" }
  ],
  dockerServices: {
    jaeger: getJaegerService()
  }
};
var prometheusFeature = {
  name: FEATURE_NAMES.PROMETHEUS,
  condition: (a) => a.observability === OBSERVABILITY.PROMETHEUS,
  dependencies: ["@willsoto/nestjs-prometheus", "prom-client"],
  files: () => [
    { src: "modules/observability/prometheus.module.ts.ejs", dest: `${PATHS.OBSERVABILITY}/prometheus.module.ts`, type: "render" }
  ],
  injection: {
    moduleName: "MetricsModule",
    importPath: () => `${getRelativeImportPath(PATHS.OBSERVABILITY)}/prometheus.module`
  },
  dockerServices: () => ({ prometheus: getPrometheusService() })
};
var swaggerFeature = {
  name: FEATURE_NAMES.SWAGGER,
  condition: (a) => a.apiDocs,
  dependencies: ["@nestjs/swagger"]
};
var opossumFeature = {
  name: FEATURE_NAMES.OPOSSUM,
  condition: (a) => a.opossum,
  dependencies: ["opossum"],
  devDependencies: ["@types/opossum"],
  files: () => [
    { src: "modules/resiliency/circuit-breaker.service.ts.ejs", dest: `${PATHS.RESILIENCY}/circuit-breaker.service.ts`, type: "render" },
    { src: "modules/resiliency/circuit-breaker.service.spec.ts.ejs", dest: `${PATHS.RESILIENCY}/circuit-breaker.service.spec.ts`, type: "render" },
    { src: "modules/resiliency/resiliency.module.ts.ejs", dest: `${PATHS.RESILIENCY}/resiliency.module.ts`, type: "render" }
  ],
  injection: {
    moduleName: "ResiliencyModule",
    importPath: () => `${getRelativeImportPath(PATHS.RESILIENCY)}/resiliency.module`
  }
};

// src/features/database.ts
var postgresTypeOrmFeature = {
  name: FEATURE_NAMES.POSTGRESQL,
  condition: (a) => !!a.databases?.includes(DATABASES.POSTGRESQL) && a.postgresOrm === ORMS.TYPEORM,
  dependencies: ["@nestjs/typeorm", "typeorm", "pg"],
  devDependencies: ["@types/pg"],
  files: () => [
    { src: "modules/database/postgres-typeorm/database.module.ts.ejs", dest: `${PATHS.DATABASE}/postgres/database.module.ts`, type: "render" },
    { src: "modules/database/postgres-typeorm/database.service.ts.ejs", dest: `${PATHS.DATABASE}/postgres/database.service.ts`, type: "render" },
    { src: "modules/database/postgres-typeorm/database.service.spec.ts.ejs", dest: `${PATHS.DATABASE}/postgres/database.service.spec.ts`, type: "render" },
    { src: "modules/database/postgres-typeorm/example.entity.ts.ejs", dest: `${PATHS.DATABASE}/postgres/example.entity.ts`, type: "render" }
  ],
  injection: {
    moduleName: "PostgresDatabaseModule",
    importPath: () => `${getRelativeImportPath(PATHS.DATABASE)}/postgres/database.module`
  },
  dockerServices: () => ({ postgres: getPostgresService() })
};
var postgresPrismaFeature = {
  name: FEATURE_NAMES.POSTGRESQL,
  condition: (a) => !!a.databases?.includes(DATABASES.POSTGRESQL) && a.postgresOrm === ORMS.PRISMA,
  dependencies: ["@prisma/client"],
  devDependencies: ["prisma"],
  files: () => [
    { src: "modules/database/postgres-prisma/prisma.module.ts.ejs", dest: `${PATHS.DATABASE}/postgres/prisma.module.ts`, type: "render" },
    { src: "modules/database/postgres-prisma/prisma.service.ts.ejs", dest: `${PATHS.DATABASE}/postgres/prisma.service.ts`, type: "render" },
    { src: "modules/database/postgres-prisma/schema.prisma.ejs", dest: `${PATHS.DATABASE}/postgres/prisma/schema.prisma`, type: "render" }
  ],
  injection: {
    moduleName: "PostgresPrismaModule",
    importPath: () => `${getRelativeImportPath(PATHS.DATABASE)}/postgres/prisma.module`
  },
  dockerServices: () => ({ postgres: getPostgresService() })
};
var mysqlTypeOrmFeature = {
  name: FEATURE_NAMES.MYSQL,
  condition: (a) => !!a.databases?.includes(DATABASES.MYSQL) && a.mysqlOrm === ORMS.TYPEORM,
  dependencies: ["@nestjs/typeorm", "typeorm", "mysql2"],
  files: () => [
    { src: "modules/database/mysql-typeorm/database.module.ts.ejs", dest: `${PATHS.DATABASE}/mysql/database.module.ts`, type: "render" },
    { src: "modules/database/mysql-typeorm/database.service.ts.ejs", dest: `${PATHS.DATABASE}/mysql/database.service.ts`, type: "render" },
    { src: "modules/database/mysql-typeorm/database.service.spec.ts.ejs", dest: `${PATHS.DATABASE}/mysql/database.service.spec.ts`, type: "render" },
    { src: "modules/database/mysql-typeorm/example.entity.ts.ejs", dest: `${PATHS.DATABASE}/mysql/example.entity.ts`, type: "render" }
  ],
  injection: {
    moduleName: "MysqlDatabaseModule",
    importPath: () => `${getRelativeImportPath(PATHS.DATABASE)}/mysql/database.module`
  },
  dockerServices: () => ({ mysql: getMysqlService() })
};
var mysqlPrismaFeature = {
  name: FEATURE_NAMES.MYSQL,
  condition: (a) => !!a.databases?.includes(DATABASES.MYSQL) && a.mysqlOrm === ORMS.PRISMA,
  dependencies: ["@prisma/client"],
  devDependencies: ["prisma"],
  files: () => [
    { src: "modules/database/mysql-prisma/prisma.module.ts.ejs", dest: `${PATHS.DATABASE}/mysql/prisma.module.ts`, type: "render" },
    { src: "modules/database/mysql-prisma/prisma.service.ts.ejs", dest: `${PATHS.DATABASE}/mysql/prisma.service.ts`, type: "render" },
    { src: "modules/database/mysql-prisma/schema.prisma.ejs", dest: `${PATHS.DATABASE}/mysql/prisma/schema.prisma`, type: "render" }
  ],
  injection: {
    moduleName: "MysqlPrismaModule",
    importPath: () => `${getRelativeImportPath(PATHS.DATABASE)}/mysql/prisma.module`
  },
  dockerServices: () => ({ mysql: getMysqlService() })
};
var mongooseFeature = {
  name: FEATURE_NAMES.MONGODB,
  condition: (a) => !!a.databases?.includes(DATABASES.MONGODB),
  dependencies: ["@nestjs/mongoose", "mongoose"],
  files: () => [
    { src: "modules/database/mongo/database.module.ts.ejs", dest: `${PATHS.DATABASE}/mongo/database.module.ts`, type: "render" },
    { src: "modules/database/mongo/database.service.ts.ejs", dest: `${PATHS.DATABASE}/mongo/database.service.ts`, type: "render" },
    { src: "modules/database/mongo/database.service.spec.ts.ejs", dest: `${PATHS.DATABASE}/mongo/database.service.spec.ts`, type: "render" },
    { src: "modules/database/mongo/example.schema.ts.ejs", dest: `${PATHS.DATABASE}/mongo/example.entity.ts`, type: "render" }
  ],
  injection: {
    moduleName: "MongoDatabaseModule",
    importPath: () => `${getRelativeImportPath(PATHS.DATABASE)}/mongo/database.module`
  },
  dockerServices: (a) => ({ mongo: getMongoService(a) })
};

// src/features/rest-crud.ts
var restCrudFeature = {
  name: FEATURE_NAMES.REST_CRUD,
  condition: (a) => a.protocols.includes(PROTOCOLS.REST) && a.database && (a.databases?.includes(DATABASES.POSTGRESQL) && a.postgresOrm === ORMS.TYPEORM || a.databases?.includes(DATABASES.MYSQL) && a.mysqlOrm === ORMS.TYPEORM || !!a.databases?.includes(DATABASES.MONGODB)),
  dependencies: (a) => {
    const deps = [];
    if (!a.apiDocs) deps.push("@nestjs/mapped-types");
    return deps;
  },
  files: (a) => {
    const files = [];
    const restExamplePath = `${PATHS.EXAMPLES}/rest`;
    const dtoPath = `${restExamplePath}/dto`;
    const addDtoFiles = () => {
      if (files.some((f) => f.dest.includes("/dto/"))) return;
      files.push({
        src: "modules/rest-crud/dto/create-example.dto.ts.ejs",
        dest: `${dtoPath}/create-example.dto.ts`,
        type: "render"
      });
      files.push({
        src: "modules/rest-crud/dto/update-example.dto.ts.ejs",
        dest: `${dtoPath}/update-example.dto.ts`,
        type: "render"
      });
    };
    if (a.databases?.includes(DATABASES.POSTGRESQL) && a.postgresOrm === ORMS.TYPEORM) {
      addDtoFiles();
      files.push({
        src: "modules/rest-crud/postgres-controller.ts.ejs",
        dest: `${restExamplePath}/postgres-example.controller.ts`,
        type: "render"
      });
      files.push({
        src: "modules/rest-crud/postgres-controller.spec.ts.ejs",
        dest: `${restExamplePath}/postgres-example.controller.spec.ts`,
        type: "render"
      });
    }
    if (a.databases?.includes(DATABASES.MYSQL) && a.mysqlOrm === ORMS.TYPEORM) {
      addDtoFiles();
      files.push({
        src: "modules/rest-crud/mysql-controller.ts.ejs",
        dest: `${restExamplePath}/mysql-example.controller.ts`,
        type: "render"
      });
      files.push({
        src: "modules/rest-crud/mysql-controller.spec.ts.ejs",
        dest: `${restExamplePath}/mysql-example.controller.spec.ts`,
        type: "render"
      });
    }
    if (a.databases?.includes(DATABASES.MONGODB)) {
      addDtoFiles();
      files.push({
        src: "modules/rest-crud/mongoose-controller.ts.ejs",
        dest: `${restExamplePath}/mongo-example.controller.ts`,
        type: "render"
      });
      files.push({
        src: "modules/rest-crud/mongoose-controller.spec.ts.ejs",
        dest: `${restExamplePath}/mongo-example.controller.spec.ts`,
        type: "render"
      });
    }
    if (files.length > 0) {
      files.push({
        src: "modules/rest-crud/examples.module.ts.ejs",
        dest: `${PATHS.EXAMPLES}/examples.module.ts`,
        type: "render"
      });
    }
    return files;
  },
  injection: {
    moduleName: "ExamplesModule",
    importPath: "./examples/examples.module"
  }
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
  // Database
  postgresTypeOrmFeature,
  postgresPrismaFeature,
  mysqlTypeOrmFeature,
  mysqlPrismaFeature,
  mongooseFeature,
  // Logging / observability
  winstonFeature,
  pinoFeature,
  openTelemetryFeature,
  prometheusFeature,
  swaggerFeature,
  opossumFeature,
  restCrudFeature
];

export {
  FEATURES
};
