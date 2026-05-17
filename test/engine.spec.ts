import { jest } from '@jest/globals';

// 1. Setup ESM Mocks
const mockFs = {
  existsSync: jest.fn() as unknown as jest.Mock<(path: string) => boolean>,
  readFile: jest.fn() as unknown as jest.Mock<(path: string, encoding: string) => Promise<string>>,
  readJson: jest.fn() as unknown as jest.Mock<(path: string) => Promise<any>>,
  writeJson: jest.fn() as unknown as jest.Mock<(path: string, data: any, options?: any) => Promise<void>>,
  outputFile: jest.fn() as unknown as jest.Mock<(path: string, data: string) => Promise<void>>,
  ensureDir: jest.fn() as unknown as jest.Mock<(path: string) => Promise<void>>,
  copy: jest.fn() as unknown as jest.Mock<(src: string, dest: string) => Promise<void>>,
  remove: jest.fn() as unknown as jest.Mock<(path: string) => Promise<void>>,
};

const mockSpawnOn = jest.fn() as unknown as jest.Mock<(event: string, cb: any) => void>;
const mockSpawn = jest.fn((cmd: string, args: string[], options: any) => ({
  on: mockSpawnOn,
}));

const mockOraInstance = {
  start: jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail: jest.fn().mockReturnThis(),
  warn: jest.fn().mockReturnThis(),
  text: '',
};

const mockOra = jest.fn(() => mockOraInstance);

const mockAstUtils = {
  injectModuleToAppModule: jest.fn(),
};

const mockComposeUtils = {
  updateDockerCompose: jest.fn(),
};

jest.unstable_mockModule('fs-extra', () => ({ default: mockFs }));
jest.unstable_mockModule('child_process', () => ({
  spawn: mockSpawn
}));
jest.unstable_mockModule('ora', () => ({ default: mockOra }));
jest.unstable_mockModule('../src/generator/ast-utils.js', () => mockAstUtils);
jest.unstable_mockModule('../src/generator/compose-utils.js', () => mockComposeUtils);

// Simulate templates directory discovery globally before import
mockFs.existsSync.mockImplementation((path: string) => path.includes('templates'));

// 2. Import module under test dynamically AFTER mocking
const { generateProject, addFeature } = await import('../src/generator/engine.js');
import { PromptAnswers } from '../src/features/types.js';
import {
  PROTOCOLS,
  DATABASES,
  LOGGERS,
  OBSERVABILITY,
  MESSAGING,
  FEATURE_NAMES
} from '../src/constants/index.js';

describe('Engine Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock behavior
    mockSpawnOn.mockImplementation((event: string, cb: any) => {
      if (event === 'close') cb(0);
    });
    mockFs.existsSync.mockImplementation((path: string) => 
      path.includes('templates') || path.includes('test-app')
    );
    mockFs.readJson.mockResolvedValue({ name: 'test-app' });
    mockFs.readFile.mockResolvedValue('template content');
  });

  describe('generateProject', () => {
    const mockAnswers: PromptAnswers = {
      projectName: 'test-app',
      packageManager: 'npm',
      protocols: [PROTOCOLS.REST],
      httpAdapter: 'Express',
      database: false,
      databases: [],
      messagingQueue: false,
      redisCache: true,
      logger: LOGGERS.WINSTON,
      observability: OBSERVABILITY.OPENTELEMETRY,
      apiDocs: true,
      opossum: false,
      dlqAndRetries: false
    };

    it('should execute the nest CLI and install dependencies successfully', async () => {
      await generateProject(mockAnswers);

      // Verify Nest CLI was called via spawn
      expect(mockSpawn).toHaveBeenCalledWith(
        'npx',
        expect.arrayContaining(['@nestjs/cli', 'new', 'test-app']),
        expect.any(Object)
      );

      // Verify Redis dependencies were installed (since redisCache = true)
      expect(mockSpawn).toHaveBeenCalledWith(
        'npm',
        expect.arrayContaining(['install', '@nestjs/cache-manager', 'cache-manager', 'cache-manager-redis-store']),
        expect.any(Object)
      );

      expect(mockOraInstance.succeed).toHaveBeenCalled();
    });

    it('should handle project generation failure gracefully', async () => {
      // Simulate failure on the first spawn call
      mockSpawnOn.mockImplementationOnce((event: string, cb: any) => {
        if (event === 'close') cb(1);
      });

      await expect(generateProject(mockAnswers)).rejects.toThrow();
      expect(mockOraInstance.fail).toHaveBeenCalledWith('Failed to scaffold base project.');
      expect(mockFs.remove).toHaveBeenCalled();
    });

    it('should warn if package installation fails', async () => {
      // Mock console.error to suppress the intentional error output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      let closeCallCount = 0;
      mockSpawnOn.mockImplementation((event: string, cb: any) => {
        if (event === 'close') {
          closeCallCount++;
          cb(closeCallCount === 1 ? 0 : 1); // 1st call (npx) succeeds, 2nd (npm install) fails
        }
      });

      // It shouldn't throw, just warn
      await generateProject(mockAnswers);
      expect(mockOraInstance.warn).toHaveBeenCalledWith(expect.stringContaining('Some packages failed to install'));
      
      consoleSpy.mockRestore();
    });

    it('should update nest-cli.json to include gRPC assets if gRPC is selected', async () => {
      const grpcAnswers = { ...mockAnswers, protocols: [PROTOCOLS.GRPC] };
      await generateProject(grpcAnswers);
      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('nest-cli.json'),
        expect.objectContaining({
          compilerOptions: expect.objectContaining({
            assets: expect.arrayContaining(['**/*.proto'])
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('addFeature', () => {
    const mockAnswers: PromptAnswers = {
      projectName: 'test-app',
      packageManager: 'npm',
      protocols: [PROTOCOLS.REST],
      messagingQueue: true,
      queueType: MESSAGING.RABBITMQ,
      redisCache: false,
      database: false,
      databases: [],
      logger: LOGGERS.NONE,
      observability: OBSERVABILITY.NONE,
      apiDocs: false,
      opossum: false,
      dlqAndRetries: true
    };

    it('should throw if not in a NestJS project', async () => {
      mockFs.existsSync.mockReturnValue(false);
      await expect(addFeature(FEATURE_NAMES.RABBITMQ, mockAnswers)).rejects.toThrow(
        'This command must be run from the root of a NestJS project.'
      );
    });

    it('should throw if feature already exists', async () => {
      // Simulate templates directory discovery and project dir existence
    mockFs.existsSync.mockImplementation((path: string) => 
      path.includes('templates') || path.includes('test-app')
    );
      // Mocking specific files to "exist"
      mockFs.existsSync.mockImplementation((p: string) => p.includes('package.json') || p.includes('app.module.ts') || p.includes('rabbitmq'));

      await expect(addFeature(FEATURE_NAMES.RABBITMQ, mockAnswers)).rejects.toThrow(
        /Feature "RabbitMQ" appears to already be installed/
      );
    });

    it('should install dependencies and inject AST successfully', async () => {
      mockFs.existsSync.mockImplementation((p: string) => p.includes('package.json') || p.includes('app.module.ts'));

      await addFeature(FEATURE_NAMES.RABBITMQ, mockAnswers);

      // Verify dependency installation
      expect(mockSpawn).toHaveBeenCalledWith(
        'npm',
        expect.arrayContaining(['install', 'amqplib', '@nestjs/microservices']),
        expect.any(Object)
      );

      // Verify AST injection
      expect(mockAstUtils.injectModuleToAppModule).toHaveBeenCalled();
      expect(mockOraInstance.succeed).toHaveBeenCalledWith(expect.stringMatching(/RabbitMQ.*added successfully/));
    });
  });
});
