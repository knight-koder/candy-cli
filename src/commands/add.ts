import { Command } from 'commander';
import chalk from 'chalk';
import { runAddPrompts } from '../prompts/index.js';
import { 
  CLI_FEATURE_LIST,
  MESSAGING_FEATURES,
  DATABASES,
  ORMS,
  PROTOCOLS,
  FEATURE_NAMES
} from '../constants/index.js';
import { 
  DatabaseFeature,
  ProtocolFeature,
  PromptAnswers 
} from '../features/types.js';
import { 
  isMessagingFeature, 
  isDatabaseFeature, 
  isProtocolFeature,
  mapFeatureToLogger,
  mapFeatureToObservability 
} from '../features/utils.js';

export function registerAddCommand(program: Command): void {
  program
    .command('add [featureName]')
    .description(`Add a new feature to an existing project.\n\nAvailable features:\n${CLI_FEATURE_LIST.map(f => `  - ${f}`).join('\n')}`)
    .action(async (featureName?: string) => {
      console.log(chalk.blue.bold('\n🔧 Adding a new feature to your microservice...\n'));
      try {
        const { FEATURES } = await import('../features/index.js');
        const featureList = FEATURES
          .filter(f => f.name !== FEATURE_NAMES.BASE && f.name !== FEATURE_NAMES.MICROSERVICES_BASE)
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
        } else if (isMessagingFeature(feature)) {
           const { confirm } = await import('@inquirer/prompts');
           dlqAndRetries = await confirm({
             message: `Configure Dead Letter Queue (DLQ) and Retries for ${feature}?`,
             default: true
           });
        }

        let postgresOrm: PromptAnswers['postgresOrm'];
        let mysqlOrm: PromptAnswers['mysqlOrm'];

        if (feature === FEATURE_NAMES.POSTGRESQL || feature === FEATURE_NAMES.MYSQL) {
          const { select } = await import('@inquirer/prompts');
          const ormChoice = await select({
            message: `Which ORM for ${feature}? (Use arrow keys)`,
            choices: [
              { value: ORMS.TYPEORM, name: 'TypeORM (decorator-based, NestJS-native)' },
              { value: ORMS.PRISMA,  name: 'Prisma  (schema-first, type-safe client)' },
            ],
            default: ORMS.TYPEORM,
          }) as PromptAnswers['postgresOrm'];
          if (feature === FEATURE_NAMES.POSTGRESQL) postgresOrm = ormChoice;
          if (feature === FEATURE_NAMES.MYSQL)      mysqlOrm    = ormChoice;
        }

        const isMessaging = isMessagingFeature(feature);
        const isDatabase = isDatabaseFeature(feature);
        const isProtocol = isProtocolFeature(feature);

        const answers: PromptAnswers = {
          projectName: '',
          packageManager: 'npm',
          messagingQueue: isMessaging,
          queueType: (isMessaging ? feature : undefined) as PromptAnswers['queueType'],
          redisCache: feature === FEATURE_NAMES.REDIS,
          database: isDatabase,
          databases: isDatabase ? [feature as DatabaseFeature] : [],
          postgresOrm,
          mysqlOrm,
          logger: mapFeatureToLogger(feature),
          observability: mapFeatureToObservability(feature),
          opossum: feature === FEATURE_NAMES.OPOSSUM,
          dlqAndRetries,
          protocols: isProtocol ? [feature as ProtocolFeature] : [],
          apiDocs: feature === FEATURE_NAMES.SWAGGER,
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
