import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaProducerService } from './kafka.producer.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const username = configService.get<string>('KAFKA_SASL_USERNAME');
          const password = configService.get<string>('KAFKA_SASL_PASSWORD');
          const sasl = username && password ? {
            mechanism: 'plain' as const,
            username,
            password,
          } : undefined;

          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'my-microservice',
                brokers: (configService.get<string>('KAFKA_BROKERS') || 'localhost:9092').split(','),
                retry: {
                  initialRetryTime: 1000,
                  retries: 30,
                },
                ssl: configService.get<boolean>('KAFKA_SSL') || false,
                sasl,
              },
              consumer: {
                groupId: 'my-microservice-consumer',
              },
              producer: {
                allowAutoTopicCreation: true,
              },
            },
          };
        },
      },
    ]),
  ],
  providers: [KafkaProducerService],
  exports: [ClientsModule, KafkaProducerService],
})
export class KafkaModule {}
