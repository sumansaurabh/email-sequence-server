import {
    Entity,
    Column,
    Index,
  } from 'typeorm';
  import { BaseDbEntity } from '../entity/basedb.entity';

@Entity()
export class Tracker extends BaseDbEntity{

  @Index({ unique: true })
  @Column({ length: 2000 })
  url: string;

  @Column({ nullable: true})
  client_id: number;

  @Column({ nullable: true})
  user_id: number;
}