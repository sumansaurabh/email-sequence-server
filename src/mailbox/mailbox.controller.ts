import { Controller, Get, Request, Post, Body, Param, ParseIntPipe, UseGuards, BadRequestException, Put } from '@nestjs/common';
import { MailBoxService } from './mailbox.service';
import { MailBoxDto } from './mailbox.dto';
import { Unique } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roels.guard';
import { UserRole } from 'src/entity/user.entity';
import { Roles } from 'src/auth/roles.decorator';

@Controller('mailbox')
export class MailBoxController {
    constructor(private readonly mailBoxService: MailBoxService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Request() req, @Body() mailBoxDto: MailBoxDto): Promise<MailBoxDto> {
        mailBoxDto.userId = req.user.id;
        return this.mailBoxService.add(mailBoxDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Only admins can access this route
    async findAll(): Promise<MailBoxDto[]> {
        return this.mailBoxService.findAll();
    }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    async findByUserId(@Request() req): Promise<MailBoxDto[]> {
        const userId = req.user.id;
        return this.mailBoxService.findByUserId(userId);
    }
}
