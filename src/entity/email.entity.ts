import {
  Entity,
  Column,
  Index,
  Timestamp,
} from 'typeorm';
import { BaseDbEntity } from '../entity/basedb.entity';

@Entity()
export class Email extends BaseDbEntity {

  @Column()
  recipient: string;

  @Column()
  subject: string;

  @Column()
  sender: string;

  @Column({ default: false })
  delivered: boolean;

  @Column({ default: false })
  opened: boolean;

  @Column({ default: false })
  clicked: boolean;

  @Column({ nullable: true })
  domainName: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Index()
  @Column('timestamp')
  executionTime: Timestamp;

  @Column({ nullable: true })
  @Index()
  serviceUsed: string;
}
