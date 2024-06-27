import { Controller, Post, Get, Param, Query, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async sendEmail(
    @Body() body: { email: string; password: string; },
  ) {
    
    
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
