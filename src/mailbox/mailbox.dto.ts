import { IsString, IsNumber, IsBoolean, ValidateNested, IsEmail, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ImapConfig, SmtpConfig } from 'src/entity/mailbox.entity';

export class MailBoxDto {
    id: number;

    @IsString()
    @IsEmail()
    emailId: string;

    @IsString()
    name: string;

    userId: number;

    @ValidateNested()
    @Type(() => SmtpConfig)
    @IsNotEmpty()
    smtpConfig: SmtpConfig;

    @ValidateNested()
    @Type(() => ImapConfig)
    imapConfig: ImapConfig;

    @IsNotEmpty()
    @IsBoolean()
    shouldCheckReplies: boolean;

    sentEmails: number = 0;
    failedEmails: number = 0;
}