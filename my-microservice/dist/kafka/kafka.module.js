"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
const kafka_producer_service_1 = require("./kafka.producer.service");
let KafkaModule = class KafkaModule {
};
exports.KafkaModule = KafkaModule;
exports.KafkaModule = KafkaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.registerAsync([
                {
                    name: 'KAFKA_SERVICE',
                    imports: [config_1.ConfigModule],
                    inject: [config_1.ConfigService],
                    useFactory: (configService) => {
                        const username = configService.get('KAFKA_SASL_USERNAME');
                        const password = configService.get('KAFKA_SASL_PASSWORD');
                        const sasl = username && password ? {
                            mechanism: 'plain',
                            username,
                            password,
                        } : undefined;
                        return {
                            transport: microservices_1.Transport.KAFKA,
                            options: {
                                client: {
                                    clientId: 'my-microservice',
                                    brokers: (configService.get('KAFKA_BROKERS') || 'localhost:9092').split(','),
                                    retry: {
                                        initialRetryTime: 1000,
                                        retries: 30,
                                    },
                                    ssl: configService.get('KAFKA_SSL') || false,
                                    sasl,
                                },
                                consumer: {
                                    groupId: 'my-microservice-consumer',
                                },
                                producer: {
                                    allowAutoTopicCreation: true,
                                },
                            },
                        };
                    },
                },
            ]),
        ],
        providers: [kafka_producer_service_1.KafkaProducerService],
        exports: [microservices_1.ClientsModule, kafka_producer_service_1.KafkaProducerService],
    })
], KafkaModule);
//# sourceMappingURL=kafka.module.js.map