import { IsString, IsNumber, IsBoolean, ValidateNested, IsEmail, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { SmtpConfig } from 'src/entity/mailbox.entity';

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
}