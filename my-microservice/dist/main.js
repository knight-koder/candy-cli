"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const nest_winston_1 = require("nest-winston");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const corsOrigin = configService.get('CORS_ORIGIN');
    app.enableCors({
        origin: corsOrigin || false,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });
    app.setGlobalPrefix('api/v1', {
        exclude: [{ path: 'health', method: common_1.RequestMethod.GET }],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableShutdownHooks();
    app.useLogger(app.get(nest_winston_1.WINSTON_MODULE_NEST_PROVIDER));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('my-microservice API')
        .setDescription('my-microservice microservice API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
        options: {
            client: {
                clientId: 'my-microservice',
                brokers: (configService.get('KAFKA_BROKERS') || 'localhost:9092').split(','),
                retry: {
                    initialRetryTime: 1000,
                    retries: 30,
                },
            },
            consumer: { groupId: 'my-microservice-consumer' },
        },
    });
    await app.init();
    await app.startAllMicroservices();
    logger.log('All connected microservices started');
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    logger.log(`my-microservice service running on port ${port}`);
    logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map