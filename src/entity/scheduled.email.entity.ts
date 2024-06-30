import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, In } from 'typeorm';
import { BaseDbEntity } from './basedb.entity';
import { Outreach } from './outreach.entity';
import { Client } from './client.entity';
import { MailBox } from './mailbox.entity';

enum ScheduledEmailState {
    SCHEDULE = 'SCHEDULE',
    SENT = 'SENT',
    FAILED = 'FAILED',
}


@Entity()
export class ScheduledEmail extends BaseDbEntity {
    @Index()
    @Column()
    name: string;

    @Index()
    @Column()
    userId: number;

    @Index()
    @Column()
    clientId: number;

    @Index()
    @Column()
    taskName: string;

    @Index()
    @Column()
    sendEmailId: string;

    @Column({
        type: 'enum',
        enum: ScheduledEmailState,
        default: ScheduledEmailState.SCHEDULE,
    })
    state: ScheduledEmailState;

    @ManyToOne(() => Client)
    client: Client;

    @ManyToOne(() => Outreach)
    outreach: Outreach;

    @Column()
    outreachStateId: number;

    @ManyToOne(() => MailBox)
    mailbox: MailBox;
}