import { Injectable, Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private breakers = new Map<string, CircuitBreaker<unknown[], unknown>>();

  /**
   * Get or create a circuit breaker for a specific action
   */
  createBreaker<T>(
    name: string,
    action: (...args: unknown[]) => Promise<T>,
    options: CircuitBreakerOptions = {},
  ): CircuitBreaker<unknown[], T> {
    if (this.breakers.has(name)) {
      return this.breakers.get(name) as CircuitBreaker<unknown[], T>;
    }

    const breaker = new CircuitBreaker(action, {
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

    this.breakers.set(name, breaker as CircuitBreaker<unknown[], unknown>);
    return breaker as CircuitBreaker<unknown[], T>;
  }

  /**
   * Execute an action within a circuit breaker
   */
  async fire<T>(
    name: string,
    action: (...args: unknown[]) => Promise<T>,
    args: unknown[] = [],
    options?: CircuitBreakerOptions,
  ): Promise<T> {
    const breaker = this.createBreaker(name, action, options);
    return breaker.fire(...args) as Promise<T>;
  }
}
