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
var KafkaConsumerController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConsumerController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
let KafkaConsumerController = KafkaConsumerController_1 = class KafkaConsumerController {
    logger = new common_1.Logger(KafkaConsumerController_1.name);
    async handleMessage(message) {
        this.logger.log(`Received Kafka message: ${JSON.stringify(message)}`);
    }
    async handleEvent(data) {
        this.logger.log(`Received Kafka event: ${JSON.stringify(data)}`);
    }
};
exports.KafkaConsumerController = KafkaConsumerController;
__decorate([
    (0, microservices_1.MessagePattern)('my-topic'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KafkaConsumerController.prototype, "handleMessage", null);
__decorate([
    (0, microservices_1.EventPattern)('my-event'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KafkaConsumerController.prototype, "handleEvent", null);
exports.KafkaConsumerController = KafkaConsumerController = KafkaConsumerController_1 = __decorate([
    (0, common_1.Controller)()
], KafkaConsumerController);
//# sourceMappingURL=kafka.consumer.js.map