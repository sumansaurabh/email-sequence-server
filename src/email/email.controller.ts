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

@Controller('email')
export class EmailController {
    constructor(
        private readonly emailService: EmailService,
        private readonly emailScheduleService: EmailScheduleService,
    ) {}

    /**
     * Retrieves all emails.
     * 
     * @returns A Promise that resolves to an array of Email objects.
     * @throws Error if there is an issue retrieving the emails.
     */
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN) // Only admins can access this route
    async findAll(): Promise<Email[]> {
        return this.emailService.findAll();
    }

    /**
     * Retrieves emails for a specific user by user ID.
     * 
     * @param req The request object containing user information.
     * @returns A promise that resolves to an array of Email objects.
     * @throws {Error} If there is an issue retrieving emails for the user.
     */
    @Get('user')
    @UseGuards(JwtAuthGuard)
    async findByUserId(@Request() req): Promise<Email[]> {
        const userId = req.user.id;
        return this.emailService.findByUserId(userId);
    }

    /**
     * Method to track email by updating email opened status.
     * 
     * @param trackId The ID of the email to track
     * @returns A promise that resolves to a string indicating the email has been opened
     * @throws Error if there is an issue updating the email opened status
     */
    @Get('track/:id')
    async trackEmail(@Param('id') trackId: number): Promise<string> {
        this.emailService.updateEmailOpened(trackId);
        return 'Email Opened';
    }

    /**
     * Method to handle redirection based on provided id and eid.
     * 
     * @param id The id parameter for redirection.
     * @param eid The eid parameter for redirection.
     * @param res The response object.
     * @returns An object containing statusCode and url.
     * @throws Error if there is an issue updating the URL opened.
     */
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

    /**
     * Endpoint for testing email functionality.
     * Only accessible by users with admin role.
     * 
     * @param testEmailDto The data transfer object containing email test details.
     * @param req The request object.
     * @returns A promise that resolves to an Email object.
     * @throws Error if the email test service encounters an error.
     */
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
}
