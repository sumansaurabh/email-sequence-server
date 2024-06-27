import {
    Entity,
    Column,
    Index,
  } from 'typeorm';
  import { BaseDbEntity } from '../entity/basedb.entity';

@Entity()
export class User extends BaseDbEntity{

  @Index({ unique: true })
  url: string;

  @Column({ nullable: true})
  client_id: number;

  @Column({ nullable: true})
  user_id: number;
}