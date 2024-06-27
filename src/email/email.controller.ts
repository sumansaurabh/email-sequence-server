import { Controller, Post, Get, Param, Query, Body, Res } from '@nestjs/common';
import { EmailService } from './email.service';
import { Response } from 'express';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Sends an email using the provided recipient, subject, and content.
   * 
   * @param body An object containing recipient, subject, and content properties.
   * @throws {Error} If there is an issue sending the email.
   */
  @Post('register')
  async sendEmail(
    @Body() body: { recipient: string; subject: string; content: string },
  ) {
    await this.emailService.sendEmail(
      body
    );
  }



  /**
   * Method to track email by sending a tracking pixel.
   * 
   * @param id - The ID of the email to track.
   * @param res - The response object to send the tracking pixel.
   * @throws - Throws an error if there is an issue tracking the email.
   */
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
