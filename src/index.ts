import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerAddCommand } from './commands/add.js';

const program = new Command();

program
  .name('candy-cli')
  .description('A professional CLI to scaffold and extend scalable NestJS microservices')
  .version('1.0.0');

registerInitCommand(program);
registerAddCommand(program);

program.parse();
