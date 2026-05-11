import { jest } from '@jest/globals';

const mockFs = {
  existsSync: jest.fn() as jest.Mock<any>,
  readFile: jest.fn() as jest.Mock<any>,
  outputFile: jest.fn() as jest.Mock<any>,
};

jest.unstable_mockModule('fs-extra', () => ({ default: mockFs }));

const { updateDockerCompose } = await import('../src/generator/compose-utils.js');
import path from 'path';

describe('Compose Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new docker-compose.yml if it does not exist', async () => {
    mockFs.existsSync.mockReturnValue(false);

    await updateDockerCompose('/fake/dir', {
      redis: { image: 'redis:alpine' }
    });

    expect(mockFs.existsSync).toHaveBeenCalledWith(path.join('/fake/dir', 'docker-compose.yml'));
    expect(mockFs.outputFile).toHaveBeenCalledWith(
      path.join('/fake/dir', 'docker-compose.yml'),
      expect.stringContaining('redis:alpine')
    );
    expect(mockFs.outputFile).toHaveBeenCalledWith(
      path.join('/fake/dir', 'docker-compose.yml'),
      expect.stringContaining('version: "3.8"')
    );
  });

  it('should parse and merge with an existing docker-compose.yml', async () => {
    mockFs.existsSync.mockReturnValue(true);
    const existingYaml = `
version: '3.8'
services:
  app:
    image: my-app:latest
`;
    mockFs.readFile.mockResolvedValue(existingYaml);

    await updateDockerCompose('/fake/dir', {
      redis: { image: 'redis:alpine' }
    });

    expect(mockFs.readFile).toHaveBeenCalledWith(path.join('/fake/dir', 'docker-compose.yml'), 'utf8');

    // Check that outputFile was called with both services
    const outputYaml = mockFs.outputFile.mock.calls[0][1];
    expect(outputYaml).toContain('app:');
    expect(outputYaml).toContain('my-app:latest');
    expect(outputYaml).toContain('redis:');
    expect(outputYaml).toContain('redis:alpine');
  });

  it('should handle malformed existing yaml by falling back to a new object and warning', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFile.mockResolvedValue('::: INVALID YAML :::');

    await updateDockerCompose('/fake/dir', {
      redis: { image: 'redis:alpine' }
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Warning: Could not parse existing docker-compose.yml'));

    const outputYaml = mockFs.outputFile.mock.calls[0][1];
    expect(outputYaml).toContain('version: "3.8"');
    expect(outputYaml).toContain('redis:alpine');

    consoleWarnSpy.mockRestore();
  });
});
