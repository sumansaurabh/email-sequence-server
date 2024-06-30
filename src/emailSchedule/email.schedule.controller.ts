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
} from '@nestjs/common';
import { Unique } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roels.guard';
import { UserRole } from 'src/entity/user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { EmailScheduleService } from './email.schedule.service';
import { ScheduledEmail } from 'src/entity/scheduled.email.entity';

@Controller('schedule/email')
export class EmailScheduleController {
    constructor(private readonly emailScheduleService: EmailScheduleService) {}

    @Post('add/client/:clientId/outreach/:outreachId')
    @UseGuards(JwtAuthGuard)
    async addClient(
        @Request() req,
        @Param('clientId') clientId: number,
        @Param('outreachId') outreachId: number,
    ): Promise<ScheduledEmail> {
        const userId = req.user.id;
        return await this.emailScheduleService.add(userId, outreachId, clientId);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Only admins can access this route
    async findAll(): Promise<ScheduledEmail[]> {
        return this.emailScheduleService.findAll();
    }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    async findByUserId(@Request() req): Promise<ScheduledEmail[]> {
        const userId = req.user.id;
        return this.emailScheduleService.findByUserId(userId);
    }
}
