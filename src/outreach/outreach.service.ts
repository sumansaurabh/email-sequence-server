// src/users/user.service.ts
import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
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

    async add(outreachDto: OutreachDto): Promise<Outreach> {
        const user = await this.userService.findOneById(outreachDto.userId);
        if (!user) {
            throw new BadRequestException('Invalid user');
        }

        const outreach = plainToClass(Outreach, outreachDto);

        const errors = await validate(outreach);
        if (errors.length > 0) {
            throw new BadRequestException('Validation failed');
        }

        const savedOutreach = await this.outreachRepository.save(outreach);
        return savedOutreach;
    }

    async findAll(): Promise<Outreach[]> {
        return await this.outreachRepository.find();
    }

    async findByUserId(userId: number): Promise<Outreach[]> {
        return await this.outreachRepository.find({ where: { userId: { id: userId } } });
    }
}
