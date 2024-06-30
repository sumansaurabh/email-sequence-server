import {
  Entity,
  Column,
  Index,
  Timestamp,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { BaseDbEntity } from '../entity/basedb.entity';
import { Outreach } from './outreach.entity';
import { Client } from './client.entity';

@Entity()
export class Email extends BaseDbEntity {

  @OneToOne(() => Client)
  client: Client;

  @Column()
  subject: string;

  @Column()
  sender: string;

  @Column()
  @Index()
  sent: boolean;

  @Column({ default: false })
  @Index()
  delivered: boolean;

  @Column({ default: false })
  @Index()
  opened: boolean;

  @Column({ default: false })
  @Index()
  clicked: boolean;

  @Column({ nullable: true })
  @Index()
  domainName: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Index()
  @Column('timestamp')
  executionTime: Timestamp;

  @Column({ nullable: true })
  @Index()
  serviceUsed: string;

  @Column({ nullable: true })
  stage: number;

  @ManyToOne(() => Outreach)
  outreach: Outreach;
}
