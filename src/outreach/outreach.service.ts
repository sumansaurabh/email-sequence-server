// src/users/outreach.service.ts
import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outreach } from 'src/entity/outreach.entity';
import { OutreachDto } from './outreach.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UserService } from 'src/users/user.service';
import { TransformDto } from 'src/utils/transform.decorator';
import { TransformClassMethods } from 'src/utils/transform-class.decorator';

@Injectable()
@TransformClassMethods(OutreachDto)
export class OutreachService {
    saltOrRounds: number = 10;

    constructor(
        private userService: UserService,
        @InjectRepository(Outreach)
        private outreachRepository: Repository<Outreach>,
    ) {}

    @TransformDto(OutreachDto)
    async add(outreachDto: OutreachDto): Promise<Outreach> {
        const outreach = plainToClass(Outreach, outreachDto);
        const errors = await validate(outreach);
        if (errors.length > 0) {
            throw new BadRequestException('Validation failed');
        }
        try {
            const savedOutreach = await this.outreachRepository.save(outreach);
            return savedOutreach;
        }
        catch (error) {
            if (error.code === '23505') {
                throw new BadRequestException(`Outreach with the name - [${outreachDto.name}] already exists`);
            }
            throw error;
        }
    }

    @TransformDto(OutreachDto)
    async findAll(): Promise<Outreach[]> {
        return await this.outreachRepository.find();
    }

    @TransformDto(OutreachDto)
    async findByUserId(userId: number): Promise<Outreach[]> {
        return await this.outreachRepository.find({ where: { userId: userId } });
    }
}
