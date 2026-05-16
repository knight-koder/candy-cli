"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var KafkaProducerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaProducerService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
let KafkaProducerService = KafkaProducerService_1 = class KafkaProducerService {
    client;
    logger = new common_1.Logger(KafkaProducerService_1.name);
    constructor(client) {
        this.client = client;
    }
    async onModuleInit() {
        try {
            this.logger.log('Initializing Kafka admin to create topics...');
            const kafkaClient = this.client.createClient();
            const admin = kafkaClient.admin();
            await admin.connect();
            const requiredTopics = [
                'my-microservice.reply',
                'my-topic',
                'my-event',
            ];
            const existingTopics = await admin.listTopics();
            const topicsToCreate = requiredTopics
                .filter(t => !existingTopics.includes(t))
                .map(topic => ({ topic, numPartitions: 1, replicationFactor: 1 }));
            if (topicsToCreate.length > 0) {
                await admin.createTopics({ topics: topicsToCreate });
                this.logger.log(`Created missing topics: ${topicsToCreate.map(t => t.topic).join(', ')}`);
            }
            else {
                this.logger.log('All required Kafka topics already exist.');
            }
            await admin.disconnect();
        }
        catch (error) {
            this.logger.error(`Failed to initialize Kafka topics: ${error.message}`);
        }
        await this.client.connect();
    }
    async onModuleDestroy() {
        await this.client.close();
    }
    emit(topic, payload) {
        return this.client.emit(topic, payload);
    }
    async send(topic, payload) {
        return (0, rxjs_1.firstValueFrom)(this.client.send(topic, payload));
    }
};
exports.KafkaProducerService = KafkaProducerService;
exports.KafkaProducerService = KafkaProducerService = KafkaProducerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientKafka])
], KafkaProducerService);
//# sourceMappingURL=kafka.producer.service.js.map