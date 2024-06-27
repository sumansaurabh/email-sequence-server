import { Controller, Post, Get, Param, Query, Body, Res } from '@nestjs/common';
import { EmailService } from './email.service';
import { Response } from 'express';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('register')
  async sendEmail(
    @Body() body: { recipient: string; subject: string; content: string },
  ) {
    await this.emailService.sendEmail(
      body
    );
  }



  @Get('track/:id')
  async trackEmail(@Param('id') id: string, @Res() res: Response) {
    await this.emailService.trackEmail(Number(id));
    res.set('Content-Type', 'image/png');
    res.send(Buffer.from([])); // Send an empty response for the tracking pixel
  }

  @Get('unsubscribe')
  async unsubscribe(@Query('email') email: string) {
    await this.emailService.unsubscribe(email);
  }
}
