import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
  } from 'typeorm';
import { BaseDbEntity } from './basedb.entity';
  
  @Entity()
  export class OutReach extends BaseDbEntity{
    @Index()
    @Column()
    name: string;
    
    @Index()
    @Column()
    user_id: number;

    @Column()
    client_id: number;

    @Column()
    numberOfDays: number;
}
  