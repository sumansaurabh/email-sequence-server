import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { BaseDbEntity } from './basedb.entity';

interface State {
    name: string;
    scheduleAfterDays: number;
    description: string;
    templateId: string;
}

@Entity()
export class OutReach extends BaseDbEntity {
    @Index()
    @Column()
    name: string;

    @Index()
    @Column()
    user_id: number;

    @Column('simple-json', { nullable: true })
    stateList: State[];
}