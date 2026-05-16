import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ExampleStatus {
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
  PENDING  = 'pending',
}

/**
 * ExampleEntity — TypeORM reference entity for PostgreSQL.
 *
 * One column per major type is shown. Delete what you don't need and
 * run migrations after any schema change:
 *   npx typeorm migration:generate src/migrations/InitSchema -d src/database/postgres/database.module.ts
 */
@Entity('examples')
export class ExampleEntity {
  // ── Primary Key ────────────────────────────────────────────────────────────
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── String types ───────────────────────────────────────────────────────────
  @Index()
  @ApiProperty({ example: 'My Entity', description: 'The name of the example entity' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ example: 'USD', required: false })
  @Column({ type: 'char', length: 3, nullable: true })
  code?: string;                                  // fixed-length char, e.g. 'USD'

  @ApiProperty({ example: 'A detailed description', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;                           // unlimited length text

  // ── Numeric types ──────────────────────────────────────────────────────────
  @ApiProperty({ example: 1, default: 0 })
  @Column({ type: 'smallint', default: 0 })
  priority: number;                               // -32768 to 32767

  @ApiProperty({ example: 100, default: 0 })
  @Column({ type: 'int', default: 0 })
  viewCount: number;                              // standard 32-bit integer

  @Column({ type: 'bigint', nullable: true })
  externalId?: string;                            // 64-bit int (returned as string by pg)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;                                 // fixed-point, e.g. 12345678.99

  @Column({ type: 'float', nullable: true })
  score?: number;                                 // 8-byte IEEE 754 double

  // ── Boolean ────────────────────────────────────────────────────────────────
  @ApiProperty({ example: true, default: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // ── Enum ───────────────────────────────────────────────────────────────────
  @ApiProperty({ enum: ExampleStatus, default: ExampleStatus.PENDING })
  @Column({ type: 'enum', enum: ExampleStatus, default: ExampleStatus.PENDING })
  status: ExampleStatus;

  // ── Date / Time ────────────────────────────────────────────────────────────
  @Column({ type: 'date', nullable: true })
  birthDate?: string;                             // stored as YYYY-MM-DD

  @Column({ type: 'time', nullable: true })
  startTime?: string;                             // stored as HH:MM:SS

  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt?: Date;                             // timestamp with time zone

  // ── JSON ───────────────────────────────────────────────────────────────────
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;             // binary JSON — indexable, preferred

  @Column({ type: 'json', nullable: true })
  rawPayload?: Record<string, unknown>;           // text JSON — preserves key order

  // ── Arrays (PostgreSQL-native) ─────────────────────────────────────────────
  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];                                // text[]

  @Column({ type: 'int', array: true, nullable: true })
  scores?: number[];                              // int[]

  // ── Binary ─────────────────────────────────────────────────────────────────
  @Column({ type: 'bytea', nullable: true })
  thumbnail?: Buffer;                             // raw binary data

  // ── Automatic metadata ─────────────────────────────────────────────────────
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;                               // soft-delete support (use withDeleted())

  @VersionColumn()
  version: number;                                // auto-incremented on every update (optimistic locking)
}
