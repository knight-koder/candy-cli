import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerAddCommand } from './commands/add.js';

// Node version check for ESM and spawn stability
const MIN_NODE_VERSION = 18;
const currentMajorVersion = parseInt(process.versions.node.split('.')[0]);
if (currentMajorVersion < MIN_NODE_VERSION) {
  console.error(`Error: candy-nest-cli requires Node.js version ${MIN_NODE_VERSION} or higher. Current version: ${process.versions.node}`);
  process.exit(1);
}

const program = new Command();

program
  .name('candy-nest-cli')
  .description('A professional CLI to scaffold and extend scalable NestJS microservices')
  .version('1.0.0');

registerInitCommand(program);
registerAddCommand(program);

program.parse();
