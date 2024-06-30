import { IsString, IsEmail, IsOptional, IsDateString, IsPhoneNumber, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
    @IsString()
    street: string;

    @IsString()
    city: string;

    @IsString()
    state: string;
}

export class ClientDto {
    id: number;

    @IsEmail()
    email: string;

    userId: number;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsDateString()
    dob?: Date;

    @IsOptional()
    @IsPhoneNumber(null)
    phone?: string;

    @IsOptional()
    @IsString()
    zip?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    linkedin?: string;

    @IsOptional()
    @IsString()
    github?: string;

    @IsOptional()
    @IsString()
    twitter?: string;

    @IsOptional()
    @IsString()
    portfolio?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    meta?: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsBoolean()
    subscribed: boolean;

    @IsOptional()
    @IsString()
    onboardingType?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    address?: AddressDto;
}
