import { jest } from '@jest/globals';

// 1. Setup ESM Mocks
const mockFs = {
  existsSync: jest.fn() as jest.Mock<any>,
  readFile: jest.fn() as jest.Mock<any>,
  readJson: jest.fn() as jest.Mock<any>,
  writeJson: jest.fn() as jest.Mock<any>,
  outputFile: jest.fn() as jest.Mock<any>,
  ensureDir: jest.fn() as jest.Mock<any>,
  copy: jest.fn() as jest.Mock<any>,
};

const mockExec = jest.fn((cmd: any, options: any, cb: any) => {
  if (typeof options === 'function') {
    options(null, { stdout: '', stderr: '' });
  } else if (typeof cb === 'function') {
    cb(null, { stdout: '', stderr: '' });
  }
});

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

jest.unstable_mockModule('fs-extra', () => ({ default: mockFs }));
jest.unstable_mockModule('child_process', () => ({ exec: mockExec }));
jest.unstable_mockModule('ora', () => ({ default: mockOra }));
jest.unstable_mockModule('../src/generator/ast-utils.js', () => mockAstUtils);

// Simulate templates directory discovery globally before import
mockFs.existsSync.mockImplementation((path: string) => path.includes('templates'));

// 2. Import module under test dynamically AFTER mocking
const { generateProject, addFeature } = await import('../src/generator/engine.js');
import { PromptAnswers } from '../src/prompts/index.js';

describe('Engine Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mockExec to default success implementation
    mockExec.mockImplementation((cmd: any, options: any, cb: any) => {
      if (typeof options === 'function') options(null, { stdout: '', stderr: '' });
      else if (typeof cb === 'function') cb(null, { stdout: '', stderr: '' });
    });
  });

  describe('generateProject', () => {
    const mockAnswers: PromptAnswers = {
      projectName: 'test-app',
      packageManager: 'npm',
      protocols: ['REST', 'GraphQL'],
      messagingQueue: false,
      redisCache: true, // Redis feature requires @nestjs/cache-manager
      logger: 'None',
      observability: 'None',
      apiDocs: false,
      opossum: false,
      dlqAndRetries: false,
    };

    it('should execute the nest CLI and install dependencies successfully', async () => {
      mockFs.readFile.mockResolvedValue('template content');

      await generateProject(mockAnswers);

      // Verify Nest CLI was called
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('npx --yes @nestjs/cli new test-app --package-manager npm --skip-git --strict'),
        expect.any(Function)
      );

      // Verify Redis dependencies were installed (since redisCache = true)
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringMatching(/npm install.*@nestjs\/cache-manager.*cache-manager-redis-store/),
        expect.any(Object),
        expect.any(Function)
      );

      // Verify templates were rendered
      expect(mockFs.readFile).toHaveBeenCalled();
      expect(mockFs.outputFile).toHaveBeenCalled();

      // Verify Ora spinner succeeded
      expect(mockOraInstance.succeed).toHaveBeenCalledWith(expect.stringContaining('Modules injected successfully.'));
    });

    it('should handle project generation failure gracefully', async () => {
      mockExec.mockImplementationOnce((cmd: any, options: any, cb: any) => {
        // Simulate failure on the very first exec call (nest new)
        const error = new Error('Nest CLI Failed');
        if (typeof options === 'function') options(error, null);
        else cb(error, null);
      });

      await expect(generateProject(mockAnswers)).rejects.toThrow('Nest CLI Failed');
      expect(mockOraInstance.fail).toHaveBeenCalledWith('Failed to scaffold base project.');
    });

    it('should warn if package installation fails', async () => {
      mockFs.readFile.mockResolvedValue('template content');

      mockExec.mockImplementation((cmd: any, options: any, cb: any) => {
        if (typeof cmd === 'string' && cmd.includes('npm install')) {
          const error = new Error('NPM Install Failed');
          if (typeof options === 'function') options(error, null);
          else if (typeof cb === 'function') cb(error, null);
          return;
        }
        // Success for other commands
        if (typeof options === 'function') options(null, { stdout: '', stderr: '' });
        else if (typeof cb === 'function') cb(null, { stdout: '', stderr: '' });
      });

      // It shouldn't throw, just warn
      await generateProject(mockAnswers);
      expect(mockOraInstance.warn).toHaveBeenCalledWith('Some packages failed to install. You may need to install them manually.');
    });

    it('should update nest-cli.json to include gRPC assets if gRPC is selected', async () => {
      mockFs.readFile.mockResolvedValue('template content');
      mockFs.existsSync.mockImplementation((path: string) => path.includes('templates') || path.includes('nest-cli.json'));
      mockFs.readJson.mockResolvedValue({ compilerOptions: {} });

      const grpcAnswers = { ...mockAnswers, protocols: ['gRPC'] };
      await generateProject(grpcAnswers);

      expect(mockFs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('nest-cli.json'),
        expect.objectContaining({
          compilerOptions: { assets: ['**/*.proto'], watchAssets: true }
        }),
        { spaces: 2 }
      );
    });
  });

  describe('addFeature', () => {
    const mockAnswers: PromptAnswers = {
      projectName: 'test-app',
      packageManager: 'npm',
      protocols: [],
      messagingQueue: true,
      queueType: 'RabbitMQ',
      redisCache: false,
      logger: 'None',
      observability: 'None',
      apiDocs: false,
      opossum: false,
      dlqAndRetries: false,
    };

    it('should throw an error if not run inside a NestJS project', async () => {
      // Simulate missing package.json or app.module.ts
      mockFs.existsSync.mockReturnValue(false);

      await expect(addFeature('RabbitMQ', mockAnswers)).rejects.toThrow(
        'This command must be run from the root of a NestJS project.'
      );
    });

    it('should throw an error if the feature is already installed', async () => {
      // Simulate valid project root
      mockFs.existsSync.mockImplementation((path: string) => {
        if (typeof path === 'string' && (path.endsWith('package.json') || path.endsWith('app.module.ts'))) return true;
        // Simulate that RabbitMQ module ALREADY exists
        if (typeof path === 'string' && path.includes('rabbitmq')) return true;
        return false;
      });
      mockFs.readJson.mockResolvedValue({ name: 'test-app' });

      await expect(addFeature('RabbitMQ', mockAnswers)).rejects.toThrow(
        /Feature "RabbitMQ" appears to already be installed/
      );
    });

    it('should install dependencies and inject AST successfully', async () => {
      // Simulate valid project root and feature NOT installed
      mockFs.existsSync.mockImplementation((path: string) => {
        if (typeof path === 'string' && (path.endsWith('package.json') || path.endsWith('app.module.ts'))) return true;
        return false;
      });
      mockFs.readJson.mockResolvedValue({ name: 'test-app' });
      mockFs.readFile.mockResolvedValue('template content');

      await addFeature('RabbitMQ', mockAnswers);

      // Verify dependency installation
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringMatching(/npm install.*amqplib.*@nestjs\/microservices/),
        expect.any(Object),
        expect.any(Function)
      );

      // Verify AST Injection
      expect(mockAstUtils.injectModuleToAppModule).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ moduleName: 'RabbitMQModule' })
      );

      expect(mockOraInstance.succeed).toHaveBeenCalledWith(expect.stringContaining('added successfully!'));
    });

    it('should throw if unknown feature is passed', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readJson.mockResolvedValue({ name: 'test-app' });

      await expect(addFeature('NonExistentFeature', mockAnswers)).rejects.toThrow('Unknown feature: NonExistentFeature');
    });
  });
});
