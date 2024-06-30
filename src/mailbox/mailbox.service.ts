// src/users/mailbox.service.ts
import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailBox } from 'src/entity/mailbox.entity';
import { MailBoxDto } from './mailbox.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UserService } from 'src/users/user.service';
import { TransformDto } from 'src/utils/transform.decorator';
import { TransformClassMethods } from 'src/utils/transform-class.decorator';

@Injectable()
@TransformClassMethods(MailBoxDto)
export class MailBoxService {

    constructor(
        private userService: UserService,
        @InjectRepository(MailBox)
        private mailBoxRepository: Repository<MailBox>,
    ) {}

    @TransformDto(MailBoxDto)
    async add(mailBoxDto: MailBoxDto): Promise<MailBox> {
        const outreach = plainToClass(MailBox, mailBoxDto);
        const errors = await validate(outreach);
        if (errors.length > 0) {
            throw new BadRequestException('Validation failed');
        }
        const savedOutreach = await this.mailBoxRepository.save(outreach);
        return savedOutreach;
    }

    @TransformDto(MailBoxDto)
    async update(mailBoxDto: MailBoxDto): Promise<MailBox> {
        const id = mailBoxDto.id;
        if(!id) {
            throw new BadRequestException('MailBox ID is required');
        }
        const existingOutreach = await this.mailBoxRepository.find({ where: { id: id } });
        if (!existingOutreach) {
            throw new BadRequestException('MailBox not found');
        }
        return await this.add(mailBoxDto);
    }

    @TransformDto(MailBoxDto)
    async findAll(): Promise<MailBox[]> {
        return await this.mailBoxRepository.find();
    }

    @TransformDto(MailBoxDto)
    async findByUserId(userId: number): Promise<MailBox[]> {
        return await this.mailBoxRepository.find({ where: { userId: userId } });
    }
}
