import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  providers: [User],
  controllers: [EmailController],
})
export class UserModule {}
