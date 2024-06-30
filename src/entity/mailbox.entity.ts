import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, In } from 'typeorm';
import { BaseDbEntity } from './basedb.entity';
import { Outreach } from './outreach.entity';
import { Client } from './client.entity';

enum ScheduledEmailState {
    SCHEDULE = 'SCHEDULE',
    SENT = 'SENT',
    FAILED = 'FAILED',
}

class SmtpConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    }

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
}