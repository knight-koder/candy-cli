import { IsString, IsOptional, IsEnum, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ExampleStatus {
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
  PENDING  = 'pending',
}

export class CreateExampleDto {
  @ApiProperty({ example: 'My Entity', description: 'The name of the entity' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'A detailed description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ExampleStatus, default: ExampleStatus.PENDING, required: false })
  @IsOptional()
  @IsEnum(ExampleStatus)
  status?: ExampleStatus;
}
