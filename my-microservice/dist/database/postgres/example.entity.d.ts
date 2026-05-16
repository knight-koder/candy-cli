export declare enum ExampleStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending"
}
export declare class ExampleEntity {
    id: string;
    name: string;
    code?: string;
    description?: string;
    priority: number;
    viewCount: number;
    externalId?: string;
    price?: number;
    score?: number;
    isActive: boolean;
    status: ExampleStatus;
    birthDate?: string;
    startTime?: string;
    scheduledAt?: Date;
    metadata?: Record<string, unknown>;
    rawPayload?: Record<string, unknown>;
    tags?: string[];
    scores?: number[];
    thumbnail?: Buffer;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    version: number;
}
