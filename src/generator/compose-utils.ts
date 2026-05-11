import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';

export async function updateDockerCompose(targetDir: string, newServices: Record<string, any>): Promise<void> {
  const composePath = path.join(targetDir, 'docker-compose.yml');
  let composeObj: any = { version: '3.8', services: {} };

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

  const yamlStr = yaml.stringify(composeObj);
  await fs.outputFile(composePath, yamlStr);
}
