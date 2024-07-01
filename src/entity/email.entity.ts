import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, In, Unique } from 'typeorm';
import { BaseDbEntity } from './basedb.entity';
import { Outreach } from './outreach.entity';
import { Client } from './client.entity';
import { MailBox } from './mailbox.entity';
import { IsNotEmpty } from 'class-validator';

export enum ScheduledEmailState {
    SCHEDULE = 'SCHEDULE',
    DELIVERED = 'DELIVERED',
    FAILED = 'FAILED',
}

export enum Priority {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW",
}

class ClickedUrl {
    url: string;
    clickedAt: Date;
}

class OpenedEmail {
    count: number = 0;
    openedAt: Date;
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
    @Index()
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

    @Column({nullable: true})
    @Index()
    deliveryTime: Date;

    @Column({nullable: true})
    deliveryStatus: string;

    @Column({nullable: true})
    messageId: string;

    @Column({nullable: true})
    @Index()
    parentMessageId: string;

    @Column({ default: false })
    @Index()
    opened: boolean;

    @Column('simple-json', { nullable: true })
    openedEmail: OpenedEmail;

    @Column('simple-json', { nullable: true })
    clicked: ClickedUrl[];
}