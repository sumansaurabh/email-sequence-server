import {
    Controller,
    Get,
    Request,
    Post,
    Body,
    Param,
    UseGuards,
    Query,
    Redirect,
    Res,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roels.guard';
import { UserRole } from 'src/entity/user.entity';
import { Roles } from 'src/auth/roles.decorator';
import { EmailService } from './email.service';
import { Email } from 'src/entity/email.entity';
import { TestEmailDto } from './email.dto';
import { EmailScheduleService } from './email.schedule.service';
import { EmailFetchService } from './email.fetch.service';

@Controller('email')
export class EmailController {
    constructor(
        private readonly emailService: EmailService,
        private readonly emailScheduleService: EmailScheduleService,
        private readonly emailFetchService: EmailFetchService,
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Only admins can access this route
    async findAll(): Promise<Email[]> {
        return this.emailService.findAll();
    }

    @Get('user')
    @UseGuards(JwtAuthGuard)
    async findByUserId(@Request() req): Promise<Email[]> {
        const userId = req.user.id;
        return this.emailService.findByUserId(userId);
    }

    @Get('track/:id')
    async trackEmail(@Param('id') trackId: number): Promise<string> {
        this.emailService.updateEmailOpened(trackId);
        return 'Email Opened';
    }

    @Get('redirect/:id')
    @Redirect()
    async urlOpened(
        @Param('id') id: number,
        @Query('eid') eid: number,
        @Res() res: Response,
    ) {
        const url = await this.emailService.updateUrlOpened(id, eid);
        return { statusCode: HttpStatus.FOUND, url };
    }

    @Post('test')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Only admins can access this route
    async testEmail(
        @Body() testEmailDto: TestEmailDto,
        @Request() req,
    ): Promise<Email> {
        testEmailDto.userId = req.user.id;
        return await this.emailScheduleService.testEmailService(testEmailDto);
    }

    @Get('check')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Only admins can access this route
    async checkEmails(
        @Request() req,
    ): Promise<string> {
        await this.emailFetchService.runEmailDeliveredCron();
        return 'Checking emails';
    }

    @Get('schedule/email')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Only admins can access this route
    async sendScheduledEmails(
        @Request() req,
    ): Promise<string> {
        await this.emailScheduleService.sendScheduledEmails();
        return 'send scheduled emails';
    }
}
