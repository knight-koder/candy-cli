import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

/**
 * KafkaProducerService — use this to emit events and send request/reply messages.
 *
 * Inject it into any controller or service that needs to produce Kafka messages:
 *
 *   constructor(private readonly kafka: KafkaProducerService) {}
 *
 *   // Fire-and-forget event
 *   await this.kafka.emit('order.created', { orderId: '123' });
 *
 *   // Request/reply (awaits a response from a consumer)
 *   const result = await this.kafka.send('order.process', { orderId: '123' });
 */
@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly client: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Initializing Kafka admin to create topics...');
      const kafkaClient = this.client.createClient<any>();
      const admin = kafkaClient.admin();
      
      // Inherits the robust retry policy from the module config
      await admin.connect();
      
      const requiredTopics = [
        'my-microservice.reply',
        'my-topic',
        'my-event',

      ];

      const existingTopics = await admin.listTopics();
      const topicsToCreate = requiredTopics
        .filter(t => !existingTopics.includes(t))
        .map(topic => ({ topic, numPartitions: 1, replicationFactor: 1 }));

      if (topicsToCreate.length > 0) {
        await admin.createTopics({ topics: topicsToCreate });
        this.logger.log(`Created missing topics: ${topicsToCreate.map(t => t.topic).join(', ')}`);
      } else {
        this.logger.log('All required Kafka topics already exist.');
      }

      await admin.disconnect();
    } catch (error: any) {
      this.logger.error(`Failed to initialize Kafka topics: ${error.message}`);
    }

    // Subscribe to reply topics for request/reply patterns before connecting.
    // Example: this.client.subscribeToResponseOf('order.process');
    
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  /**
   * Fire-and-forget: emits an event to a Kafka topic.
   * The consumer uses @EventPattern to handle these.
   *
   * @param topic  The Kafka topic name
   * @param payload  The message payload (will be JSON-serialized)
   */
  emit<T>(topic: string, payload: T): Observable<T> {
    return this.client.emit(topic, payload);
  }

  /**
   * Request/reply: sends a message and waits for a response.
   * The consumer must use @MessagePattern and return a value.
   *
   * @param topic  The Kafka topic name
   * @param payload  The message payload
   * @returns  A promise resolving to the consumer's response
   */
  async send<TPayload, TResponse>(topic: string, payload: TPayload): Promise<TResponse> {
    return firstValueFrom(this.client.send<TResponse, TPayload>(topic, payload));
  }
}