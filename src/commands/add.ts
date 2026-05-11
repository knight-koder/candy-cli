import { Command } from 'commander';
import chalk from 'chalk';
import { runAddPrompts, PromptAnswers } from '../prompts/index.js';
import { FEATURE_HELP } from '../constants.js';

export function registerAddCommand(program: Command): void {
  program
    .command('add [featureName]')
    .description(`Add a new feature to an existing project.\n\nAvailable features:${FEATURE_HELP}`)
    .action(async (featureName?: string) => {
      console.log(chalk.blue.bold('\n🔧 Adding a new feature to your microservice...\n'));
      try {
        const { FEATURES } = await import('../generator/features.js');
        const featureList = FEATURES
          .filter(f => f.name !== 'Base' && f.name !== 'Microservices Base')
          .map(f => f.name);

        const { addFeature } = await import('../generator/engine.js');

        let feature = featureName;
        let dlqAndRetries = true;

        if (!feature || !featureList.includes(feature)) {
          if (feature && !featureList.includes(feature)) {
            console.log(chalk.yellow(`Warning: Feature "${feature}" is not recognized. Please select from the list.`));
          }
          const promptResult = await runAddPrompts(featureList);
          feature = promptResult.feature;
          dlqAndRetries = promptResult.dlqAndRetries;
        } else if (['Kafka', 'RabbitMQ', 'BullMQ'].includes(feature)) {
           const { confirm } = await import('@inquirer/prompts');
           dlqAndRetries = await confirm({
             message: `Configure Dead Letter Queue (DLQ) and Retries for ${feature}?`,
             default: true
           });
        }

        const answers: PromptAnswers = {
          projectName: '',
          packageManager: 'npm',
          messagingQueue: ['Kafka', 'RabbitMQ', 'BullMQ'].includes(feature),
          queueType: (['Kafka', 'RabbitMQ', 'BullMQ'].includes(feature) ? feature : undefined) as PromptAnswers['queueType'],
          redisCache: feature === 'Redis',
          logger: (feature === 'Winston Logger' ? 'Winston' : feature === 'Pino Logger' ? 'Pino' : 'None') as PromptAnswers['logger'],
          observability: (feature === 'OpenTelemetry' ? 'OpenTelemetry' : feature === 'Prometheus' ? 'Prometheus' : 'None') as PromptAnswers['observability'],
          opossum: feature === 'Opossum',
          dlqAndRetries,
          protocols: feature === 'GraphQL' ? ['GraphQL'] : (feature === 'gRPC' ? ['gRPC'] : []),
          apiDocs: feature === 'Swagger',
        };

        await addFeature(feature, answers);
        console.log(chalk.green.bold(`\n🎉 Feature "${feature}" added successfully!\n`));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red('\n❌ An error occurred while adding the feature:'));
        console.error(errorMessage);
        process.exit(1);
      }
    });
}
