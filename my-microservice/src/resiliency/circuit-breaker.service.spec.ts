import { Test, TestingModule } from '@nestjs/testing';
import { CircuitBreakerService } from './circuit-breaker.service';

// Mock the entire opossum library to avoid background timer issues in unit tests
jest.mock('opossum', () => {
  return jest.fn().mockImplementation((action) => ({
    fire: jest.fn().mockImplementation((...args) => action(...args)),
    fallback: jest.fn(),
    on: jest.fn(),
  }));
});

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CircuitBreakerService],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('fire should return the result of the wrapped function on success', async () => {
    const successFn = jest.fn().mockResolvedValue({ data: 'ok' });
    const result = await service.fire('test-success', successFn);
    expect(result).toEqual({ data: 'ok' });
  });

  it('fire should throw when the wrapped function fails', async () => {
    const failFn = jest.fn().mockRejectedValue(new Error('Service unavailable'));
    await expect(service.fire('test-fail', failFn)).rejects.toThrow('Service unavailable');
  });
});
