import {
    Entity,
    Column,
    Index,
  } from 'typeorm';
  import { BaseDbEntity } from './basedb.entity';

@Entity()
export class UrlShortener extends BaseDbEntity{

  @Index({ unique: true })
  @Column({ length: 2000 })
  url: string;
}