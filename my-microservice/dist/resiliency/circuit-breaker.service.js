"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CircuitBreakerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = void 0;
const common_1 = require("@nestjs/common");
const opossum_1 = __importDefault(require("opossum"));
let CircuitBreakerService = CircuitBreakerService_1 = class CircuitBreakerService {
    logger = new common_1.Logger(CircuitBreakerService_1.name);
    breakers = new Map();
    createBreaker(name, action, options = {}) {
        if (this.breakers.has(name)) {
            return this.breakers.get(name);
        }
        const breaker = new opossum_1.default(action, {
            timeout: options.timeout ?? 3000,
            errorThresholdPercentage: options.errorThresholdPercentage ?? 50,
            resetTimeout: options.resetTimeout ?? 10000,
            ...options,
        });
        breaker.fallback(() => {
            throw new Error(`[CircuitBreaker] ${name} is OPEN. Fallback triggered.`);
        });
        breaker.on('open', () => this.logger.warn(`[CircuitBreaker] ${name} OPENED`));
        breaker.on('halfOpen', () => this.logger.warn(`[CircuitBreaker] ${name} HALF-OPEN`));
        breaker.on('close', () => this.logger.log(`[CircuitBreaker] ${name} CLOSED`));
        this.breakers.set(name, breaker);
        return breaker;
    }
    async fire(name, action, args = [], options) {
        const breaker = this.createBreaker(name, action, options);
        return breaker.fire(...args);
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = CircuitBreakerService_1 = __decorate([
    (0, common_1.Injectable)()
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map