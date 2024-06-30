import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/users/user.module';
import { OutreachModule } from 'src/outreach/outreach.module';
import { MailBoxModule } from 'src/mailbox/mailbox.module';
import { Email } from 'src/entity/email.entity';
import { EmailService } from './email.service';
import { ClientModule } from 'src/client/client.module';
import { EmailController } from './email.controller';
import { UrlShortener } from 'src/entity/url.shortner';
import { EmailScheduleService } from './email.schedule.service';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [TypeOrmModule.forFeature([Email]),
  TypeOrmModule.forFeature([UrlShortener]),
  forwardRef(() => AuthModule), // <-- Use forwardRef() here
  forwardRef(() => UserModule), // Use forwardRef for potential circular dependency
  forwardRef(() => OutreachModule), // Use forwardRef for potential circular dependency
  forwardRef(() => MailBoxModule), // Use forwardRef for potential circular dependency
  forwardRef(() => ClientModule), // Use forwardRef for potential circular dependency
  ScheduleModule.forRoot(),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailScheduleService],
  exports: [EmailService, EmailScheduleService, TypeOrmModule],
})
export class EmailModule {}
