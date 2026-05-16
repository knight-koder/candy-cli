import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Observable } from 'rxjs';
export declare class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
    private readonly client;
    private readonly logger;
    constructor(client: ClientKafka);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    emit<T>(topic: string, payload: T): Observable<T>;
    send<TPayload, TResponse>(topic: string, payload: TPayload): Promise<TResponse>;
}
