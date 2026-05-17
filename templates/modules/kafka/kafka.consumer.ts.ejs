import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';

@Controller()
export class KafkaConsumerController {
  private readonly logger = new Logger(KafkaConsumerController.name);

  /**
   * Listen to a specific Kafka topic/pattern.
   * Rename 'my-topic' to your actual topic name.
   */
  @MessagePattern('my-topic')
  async handleMessage(@Payload() message: unknown): Promise<void> {
    this.logger.log(`Received Kafka message: ${JSON.stringify(message)}`);
    // Add your business logic here
  }

  /**
   * Fire-and-forget events (no reply).
   */
  @EventPattern('my-event')
  async handleEvent(@Payload() data: unknown): Promise<void> {
    this.logger.log(`Received Kafka event: ${JSON.stringify(data)}`);
  }
}
