import { Test, TestingModule } from '@nestjs/testing';
import { KafkaProducerService } from './kafka.producer.service';
import { ClientKafka } from '@nestjs/microservices';
import { of } from 'rxjs';

const mockKafkaClient = {
  subscribeToResponseOf: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  emit: jest.fn().mockReturnValue(of({})),
  send: jest.fn().mockReturnValue(of({ result: 'ok' })),
};

describe('KafkaProducerService', () => {
  let service: KafkaProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaProducerService,
        { provide: 'KAFKA_SERVICE', useValue: mockKafkaClient },
      ],
    }).compile();

    service = module.get<KafkaProducerService>(KafkaProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('emit should call client.emit with correct topic and payload', () => {
    service.emit('my-topic', { id: 1 });
    expect(mockKafkaClient.emit).toHaveBeenCalledWith('my-topic', { id: 1 });
  });

  it('send should resolve with the client response', async () => {
    const result = await service.send('order.process', { orderId: '123' });
    expect(result).toEqual({ result: 'ok' });
  });
});
