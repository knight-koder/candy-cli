import { DataSource } from 'typeorm';
export declare class PostgresDatabaseService {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    isHealthy(): Promise<boolean>;
    getDataSource(): DataSource;
}
