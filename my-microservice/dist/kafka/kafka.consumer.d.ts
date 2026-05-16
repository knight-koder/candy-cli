export declare class KafkaConsumerController {
    private readonly logger;
    handleMessage(message: unknown): Promise<void>;
    handleEvent(data: unknown): Promise<void>;
}
