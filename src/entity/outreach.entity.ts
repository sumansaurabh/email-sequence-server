import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseDbEntity } from './basedb.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

export class State {
    name: string;
    scheduleAfterDays: number;
    description: string;
    templateId: string;
}

@Entity()
export class Outreach extends BaseDbEntity {
    @Index()
    @Column()
    name: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id' })  // Specifies the foreign key column name
    userId: number;

    @Column('simple-json', { nullable: true })
    stateList: State[];
}