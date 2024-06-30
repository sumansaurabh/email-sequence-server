import { Module, forwardRef } from '@nestjs/common';
import { EmailService } from './email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ClientModule } from 'src/client/client.module';
import { Email } from 'src/entity/email.entity';
import { UrlShortener } from 'src/entity/url.shortner';
import { MailBoxModule } from 'src/mailbox/mailbox.module';
import { OutreachModule } from 'src/outreach/outreach.module';
import { UserModule } from 'src/users/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Email]),
        TypeOrmModule.forFeature([UrlShortener]),
        forwardRef(() => AuthModule), // <-- Use forwardRef() here
        forwardRef(() => UserModule), // Use forwardRef for potential circular dependency
        forwardRef(() => OutreachModule), // Use forwardRef for potential circular dependency
        forwardRef(() => MailBoxModule), // Use forwardRef for potential circular dependency
        forwardRef(() => ClientModule), // Use forwardRef for potential circular dependency
    ],
    providers: [EmailService],
})
export class EmailModule {}
