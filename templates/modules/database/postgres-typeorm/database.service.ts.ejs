import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * PostgresDatabaseService — wraps the TypeORM DataSource.
 *
 * Provides:
 *   - `isHealthy()` for readiness/liveness probes
 *   - `getDataSource()` to obtain the raw TypeORM DataSource for advanced queries
 *
 * Prefer using the injected TypeORM repositories (via TypeOrmModule.forFeature)
 * in your domain services rather than calling getDataSource() directly.
 */
@Injectable()
export class PostgresDatabaseService {
  private readonly logger = new Logger(PostgresDatabaseService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** Returns true if the database connection is active. */
  async isHealthy(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (err) {
      this.logger.error('PostgreSQL health check failed', err);
      return false;
    }
  }

  /** Exposes the raw DataSource for repository access or custom queries. */
  getDataSource(): DataSource {
    return this.dataSource;
  }
}
