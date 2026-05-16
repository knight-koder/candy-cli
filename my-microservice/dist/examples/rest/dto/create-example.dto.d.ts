export declare enum ExampleStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending"
}
export declare class CreateExampleDto {
    name: string;
    description?: string;
    status?: ExampleStatus;
}
