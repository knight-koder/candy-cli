import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
};

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(3600) },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('get should return the cached value', async () => {
    mockCacheManager.get.mockResolvedValue({ name: 'Alice' });
    const result = await service.get<{ name: string }>('user:1');
    expect(result).toEqual({ name: 'Alice' });
  });

  it('get should return null when key does not exist', async () => {
    mockCacheManager.get.mockResolvedValue(undefined);
    const result = await service.get('missing-key');
    expect(result).toBeNull();
  });

  it('set should call cache.set with key, value, and ttl', async () => {
    await service.set('user:1', { name: 'Alice' }, 120);
    expect(mockCacheManager.set).toHaveBeenCalledWith('user:1', { name: 'Alice' }, 120);
  });

  it('del should call cache.del with the correct key', async () => {
    await service.del('user:1');
    expect(mockCacheManager.del).toHaveBeenCalledWith('user:1');
  });

  it('exists should return true when key is present', async () => {
    mockCacheManager.get.mockResolvedValue('some-value');
    expect(await service.exists('user:1')).toBe(true);
  });

  it('exists should return false when key is absent', async () => {
    mockCacheManager.get.mockResolvedValue(undefined);
    expect(await service.exists('missing-key')).toBe(false);
  });

  it('setNX should set value and return true when key does not exist', async () => {
    mockCacheManager.get.mockResolvedValue(null);
    const result = await service.setNX('lock:resource', 'locked', 30);
    expect(result).toBe(true);
    expect(mockCacheManager.set).toHaveBeenCalled();
  });

  it('setNX should return false when key already exists', async () => {
    mockCacheManager.get.mockResolvedValue('locked');
    const result = await service.setNX('lock:resource', 'locked', 30);
    expect(result).toBe(false);
    expect(mockCacheManager.set).not.toHaveBeenCalled();
  });
});
