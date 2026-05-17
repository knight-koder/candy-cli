import { Command } from 'commander';
import chalk from 'chalk';
import { runPrompts } from '../prompts/index.js';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a new NestJS microservice interactively')
    .argument('[project-name]', 'Name of the project to create')
    .option('-y, --yes', 'Skip all prompts and use defaults (Standard Pack)')
    .option('--all', 'Enable ALL features and skip prompts (Kitchen Sink)')
    .option('--skip-install', 'Skip package installation')
    .action(async (projectName, options) => {
      console.log(chalk.blue.bold('\n🚀 Welcome to Candy CLI!\n'));
      try {
        const { runPrompts } = await import('../prompts/index.js');
        const answers = await runPrompts(projectName, { 
          skipPrompts: !!options.yes || !!options.all,
          full: !!options.all 
        });
        
        console.log(chalk.green('\n✓ Configuration complete. Starting generation...'));
        const { generateProject } = await import('../generator/engine.js');
        
        await generateProject({
          ...answers,
          skipInstall: !!options.skipInstall
        });
        
        console.log(chalk.green.bold('\n🎉 Microservice scaffolded successfully!\n'));
      } catch (error) {
        console.error(chalk.red('\n❌ An error occurred during scaffolding:'));
        console.error(error);
        process.exit(1);
      }
    });
}
