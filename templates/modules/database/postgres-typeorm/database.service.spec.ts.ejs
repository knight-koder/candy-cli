import { Test, TestingModule } from '@nestjs/testing';
import { PostgresDatabaseService } from './database.service';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('PostgresDatabaseService', () => {
  let service: PostgresDatabaseService;
  
  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgresDatabaseService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<PostgresDatabaseService>(PostgresDatabaseService);
    // Mock the logger to keep test output clean
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isHealthy()', () => {
    it('should return true when the DB responds', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ result: 1 }]);
      const result = await service.isHealthy();
      expect(result).toBe(true);
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return false when the DB fails', async () => {
      mockDataSource.query.mockRejectedValueOnce(new Error('Connection failed'));
      const result = await service.isHealthy();
      expect(result).toBe(false);
    });
  });

  it('getDataSource() should return the injected DataSource', () => {
    expect(service.getDataSource()).toBe(mockDataSource);
  });
});
