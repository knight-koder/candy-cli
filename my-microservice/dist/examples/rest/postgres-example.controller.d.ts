import { Repository } from 'typeorm';
import { ExampleEntity } from '../../database/postgres/example.entity';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
export declare class ExampleController {
    private readonly repository;
    constructor(repository: Repository<ExampleEntity>);
    create(data: CreateExampleDto): Promise<ExampleEntity>;
    findAll(): Promise<ExampleEntity[]>;
    findOne(id: string): Promise<ExampleEntity>;
    update(id: string, data: UpdateExampleDto): Promise<ExampleEntity>;
    remove(id: string): Promise<ExampleEntity>;
}
