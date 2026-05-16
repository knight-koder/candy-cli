import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExampleEntity } from './example.entity';
import { PostgresDatabaseService } from './database.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host:     configService.get<string>('POSTGRES_HOST')     || 'localhost',
        port:     configService.get<number>('POSTGRES_PORT')     || 5432,
        username: configService.get<string>('POSTGRES_USER')     || 'postgres',
        password: configService.get<string>('POSTGRES_PASSWORD') || 'postgres',
        database: configService.get<string>('POSTGRES_DB')       || 'my-microservice',
        entities:    [__dirname + '/**/*.entity{.ts,.js}'],
        migrations:  [__dirname + '/../../migrations/**/*{.ts,.js}'],
        // synchronize is disabled in favour of migrations (safe for production)
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging:     configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([ExampleEntity]),
  ],
  providers: [PostgresDatabaseService],
  exports: [PostgresDatabaseService, TypeOrmModule],
})
export class PostgresDatabaseModule {}
