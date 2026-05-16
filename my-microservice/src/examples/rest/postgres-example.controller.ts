import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExampleEntity } from '../../database/postgres/example.entity';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Examples (Postgres CRUD)')
@Controller('examples/postgres')
export class ExampleController {
  constructor(
    @InjectRepository(ExampleEntity)
    private readonly repository: Repository<ExampleEntity>,
  ) {}

  @ApiOperation({ summary: 'Create a new example' })
  @ApiResponse({ status: 201, description: 'Created successfully.' })
  @ApiBody({ type: CreateExampleDto })
  @Post()
  async create(@Body() data: CreateExampleDto) {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  @ApiOperation({ summary: 'List all examples' })
  @Get()
  async findAll() {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  @ApiOperation({ summary: 'Get a single example by ID' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Example with ID ${id} not found`);
    return entity;
  }

  @ApiOperation({ summary: 'Update an example' })
  @ApiBody({ type: UpdateExampleDto })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateExampleDto,
  ) {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return await this.repository.save(entity);
  }

  @ApiOperation({ summary: 'Delete an example' })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const entity = await this.findOne(id);
    return await this.repository.remove(entity);
  }
}
