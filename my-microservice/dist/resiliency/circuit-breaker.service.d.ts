import CircuitBreaker from 'opossum';
export interface CircuitBreakerOptions {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
}
export declare class CircuitBreakerService {
    private readonly logger;
    private breakers;
    createBreaker<T>(name: string, action: (...args: unknown[]) => Promise<T>, options?: CircuitBreakerOptions): CircuitBreaker<unknown[], T>;
    fire<T>(name: string, action: (...args: unknown[]) => Promise<T>, args?: unknown[], options?: CircuitBreakerOptions): Promise<T>;
}
