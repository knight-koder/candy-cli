import { Command } from 'commander';
import chalk from 'chalk';
import { runPrompts } from '../prompts/index.js';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a new NestJS microservice interactively')
    .argument('[project-name]', 'Name of the project to create')
    .action(async (projectName) => {
      console.log(chalk.blue.bold('\n🚀 Welcome to Candy CLI!\n'));
      try {
        const answers = await runPrompts(projectName);
        console.log(chalk.green('\n✓ Configuration complete. Starting generation...'));
        const { generateProject } = await import('../generator/engine.js');
        await generateProject(answers);
        console.log(chalk.green.bold('\n🎉 Microservice scaffolded successfully!\n'));
      } catch (error) {
        console.error(chalk.red('\n❌ An error occurred during scaffolding:'));
        console.error(error);
        process.exit(1);
      }
    });
}
