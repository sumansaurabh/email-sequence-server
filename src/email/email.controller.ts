import {
    Controller,
    Get,
    Request,
    Post,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    BadRequestException,
    Put,
    Query,
} from '@nestjs/common';
import { Unique } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roels.guard';
import { UserRole } from 'src/entity/user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { EmailService } from './email.service';
import { Email } from 'src/entity/email.entity';

@Controller('email')
export class EmailController {
    constructor(private readonly emailScheduleService: EmailService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Only admins can access this route
    async findAll(): Promise<Email[]> {
        return this.emailScheduleService.findAll();
    }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    async findByUserId(@Request() req): Promise<Email[]> {
        const userId = req.user.id;
        return this.emailScheduleService.findByUserId(userId);
    }

    @Get('track/:id')
    async trackEmail(@Param('id') trackId: number ): Promise<string> {
        this.emailScheduleService.updateEmailOpened(trackId);
        return "Email Opened"
    }

    @Get('redirect/:id')
    async urlOpened(
        @Param('id') id: number,
        @Query('eid') eid: number
    ): Promise<string> {
        const mainUrl = await this.emailScheduleService.updateUrlOpened(id, eid);
        return mainUrl;
    }
}
