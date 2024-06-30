import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseDbEntity } from './basedb.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class State {
    name: string;

    @IsNotEmpty()
    scheduleAfterDays: number = 2;

    description: string;

    @IsNotEmpty()
    templateId: string;
}

@Entity()
@Index(['name', 'userId'], { unique: true })
export class Outreach extends BaseDbEntity {
    @Index()
    @Column()
    name: string;

    @Index()
    @Column()
    userId: number;

    @Column('simple-json', { nullable: true })
    stateList: State[];

    @IsNotEmpty()
    subject: string;
}