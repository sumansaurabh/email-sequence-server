import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, In, Unique } from 'typeorm';
import { BaseDbEntity } from './basedb.entity';
import { Outreach } from './outreach.entity';
import { Client } from './client.entity';
import { MailBox } from './mailbox.entity';
import { IsNotEmpty } from 'class-validator';

export enum ScheduledEmailState {
    SCHEDULE = 'SCHEDULE',
    SENT = 'SENT',
    FAILED = 'FAILED',
}

enum Priority {
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
}

class ClickedUrl {
    url: string;
    clickedAt: Date;
}

@Entity()
@Unique(['userId', 'client', 'outreach', 'outreachStateId'])
export class Email extends BaseDbEntity {

    @Index()
    @Column()
    userId: number;

    @Index()
    @Column()
    taskName: string;

    @Column({
        type: 'enum',
        enum: ScheduledEmailState,
        default: ScheduledEmailState.SCHEDULE,
    })
    @Index()
    state: ScheduledEmailState;

    @ManyToOne(() => Client)
    client: Client;

    @ManyToOne(() => Outreach)
    outreach: Outreach;

    @Column()
    outreachStateId: number;

    @ManyToOne(() => MailBox)
    mailbox: MailBox;

    @Column()
    @Index()
    scheduled10minInterval: string;

    @Column({
        type: 'enum',
        enum: Priority,
        default: Priority.MEDIUM,
    })
    @Index()
    @IsNotEmpty()
    priority: Priority

    @Column({ default: false })
    @Index()
    delivered: boolean;

    @Column()
    deliveryStatus: boolean;

    @Column({ default: false })
    @Index()
    opened: boolean;

    @Column('simple-json', { nullable: true })
    clicked: ClickedUrl[];
}