import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TestEmailDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNumber()
    @IsNotEmpty()
    mailboxId: number;

    @IsNumber()
    @IsNotEmpty()
    clientId: number;

    userId: number;

    @IsNotEmpty()
    templateId: string;
}
