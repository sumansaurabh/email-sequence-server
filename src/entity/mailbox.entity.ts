import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    ManyToOne,
    In,
} from 'typeorm';
import { BaseDbEntity } from './basedb.entity';
import { Outreach } from './outreach.entity';
import { Client } from './client.entity';
import { IsBoolean, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Exclude } from 'class-transformer';

enum ScheduledEmailState {
    SCHEDULE = 'SCHEDULE',
    SENT = 'SENT',
    FAILED = 'FAILED',
}

class AuthConfig {
    @IsString()
    user: string;

    @IsString()
    @Exclude({ toPlainOnly: true })
    pass: string;
}
export class SmtpConfig {
    @IsString()
    host: string;

    @IsNumber()
    port: number;

    @IsBoolean()
    secure: boolean;

    @ValidateNested()
    auth: AuthConfig;
}

@Entity()
export class MailBox extends BaseDbEntity {
    @Index({ unique: true })
    @Column()
    emailId: string;

    @Index()
    @Column()
    userId: number;

    @Column('simple-json')
    smtpConfig: SmtpConfig;

    @Column({default: 0})
    @IsNumber()
    scheduledCount: number;

    @Column({default: 3})
    @IsNotEmpty()
    @IsNumber()
    mailsPer10Mins: number;
}
