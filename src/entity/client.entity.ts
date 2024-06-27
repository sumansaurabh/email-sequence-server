import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseDbEntity } from '../entity/basedb.entity';

@Entity()
export class User extends BaseDbEntity{

  @Index({ unique: true })
  email: string;

  @Column({ nullable: true})
  firstName: string;

  @Column({ nullable: true})
  lastName: string;

  @Column({ nullable: true})
  dob: Date;

  @Column({ nullable: true})
  phone: string;

  @Column({ nullable: true})
  address: string;

  @Column({ nullable: true})
  city: string;

  @Column({ nullable: true})
  state: string;

  @Column({ nullable: true})
  zip: string;

  @Column({ nullable: true})
  country: string;

  @Column({ nullable: true})
  linkedin: string;

  @Column({ nullable: true})
  github: string;

  @Column({ nullable: true})
  twitter: string;

  @Column({ nullable: true})
  portfolio: string;

  @Column({ nullable: true})
  title: string;

  @Column({ nullable: true})
  meta: string;

  @Column({ nullable: true})
  company: string;

  @Column({default: true})
  subscribed: boolean;

  @Column({ nullable: true})
  onboardingType: string;
}