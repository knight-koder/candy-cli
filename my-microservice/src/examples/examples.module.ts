import { Module } from '@nestjs/common';

import { PostgresDatabaseModule } from '../database/postgres/database.module';
import { ExampleController as PostgresExampleController } from './rest/postgres-example.controller';




@Module({
  imports: [
    PostgresDatabaseModule,
    
    
  ],
  controllers: [
    PostgresExampleController,
    
    
  ],
})
export class ExamplesModule {}
