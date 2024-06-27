import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    IsDateString,
    IsBoolean,
    IsNumber,
} from 'class-validator';
import { SignupType, UserRole } from 'src/entity/user.entity';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

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
    @IsString()
    phone?: string;

    @IsOptional()
    address?: {
        street: string;
        city: string;
        state: string;
    };

    @IsOptional()
    @IsString()
    zip?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    googleSignIn?: string;

    @IsOptional()
    @IsString()
    linkedSignIn?: string;

    @IsEnum(SignupType)
    signupType: SignupType;

    @IsBoolean()
    isActive: boolean;

    @IsEnum(UserRole)
    role: UserRole;
}

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    password?: string;

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
    @IsString()
    phone?: string;

    @IsOptional()
    address?: {
        street: string;
        city: string;
        state: string;
    };

    @IsOptional()
    @IsString()
    zip?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    googleSignIn?: string;

    @IsOptional()
    @IsString()
    linkedSignIn?: string;

    @IsOptional()
    @IsEnum(SignupType)
    signupType?: SignupType;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

export class UserDto {
  id: number; // assuming id is of type number

  email: string;

  firstName?: string;

  lastName?: string;

  dob?: Date;

  phone?: string;

  address?: {
    street: string;
    city: string;
    state: string;
  };

  zip?: string;

  country?: string;

  googleSignIn?: string;

  linkedSignIn?: string;

  signupType: SignupType;

  isActive: boolean;

  role: UserRole;

  createdAt: Date; // assuming BaseDbEntity has createdAt and updatedAt fields
  updatedAt: Date;
}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class JwtPayloadDto {
  @IsString()
  username: string;

  @IsNumber()
  sub: number;
}
