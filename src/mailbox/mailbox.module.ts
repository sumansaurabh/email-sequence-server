import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MailBox } from 'src/entity/mailbox.entity';
import { MailBoxController } from './mailbox.controller';
import { MailBoxService } from './mailbox.service';
import { UserModule } from 'src/users/user.module';
import { OutreachModule } from 'src/outreach/outreach.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MailBox]),
    forwardRef(() => AuthModule), // <-- Use forwardRef() here
    forwardRef(() => UserModule), // Use forwardRef for potential circular dependency
    forwardRef(() => OutreachModule), // Use forwardRef for potential circular dependency
  ],
  providers: [MailBoxService],
  controllers: [MailBoxController],
  exports: [MailBoxService, TypeOrmModule],
})
export class MailBoxModule {}
