import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';
import { DockerService } from '../features/types.js';
import { DOCKER_COMPOSE_FILE } from '../constants/index.js';

interface DockerCompose {
  services: Record<string, DockerService>;
  volumes?: Record<string, object | null>;
  networks?: Record<string, object | null>;
  [key: string]: unknown;
}

export async function updateDockerCompose(targetDir: string, newServices: Record<string, DockerService>): Promise<void> {
  const composePath = path.join(targetDir, DOCKER_COMPOSE_FILE);
  let composeObj: DockerCompose = { services: {} };

  if (fs.existsSync(composePath)) {
    const content = await fs.readFile(composePath, 'utf8');
    try {
      composeObj = yaml.parse(content) || composeObj;
      if (!composeObj.services) composeObj.services = {};
    } catch (err) {
      // If parsing fails, we'll just overwrite or append, but we should probably warn.
      console.warn(`Warning: Could not parse existing docker-compose.yml: ${(err as Error).message}`);
    }
  }

  // Merge the new services
  composeObj.services = {
    ...composeObj.services,
    ...newServices,
  };

  // Auto-declare any named volumes referenced across all services.
  // A named volume entry looks like "volume_name:/container/path".
  // Bind mounts (starting with . or /) are skipped.
  const namedVolumes: Record<string, object | null> = composeObj.volumes ?? {};
  for (const service of Object.values(composeObj.services)) {
    if (!Array.isArray(service?.volumes)) continue;
    for (const vol of service.volumes as string[]) {
      const volumeName = vol.split(':')[0];
      // Skip bind mounts (absolute paths or relative paths starting with .)
      if (!volumeName.startsWith('/') && !volumeName.startsWith('.')) {
        namedVolumes[volumeName] = namedVolumes[volumeName] ?? null;
      }
    }
  }
  if (Object.keys(namedVolumes).length > 0) {
    composeObj.volumes = namedVolumes;
  }

  // Remove obsolete top-level version key
  delete composeObj.version;

  const yamlStr = yaml.stringify(composeObj);
  await fs.outputFile(composePath, yamlStr);
}
