import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BaseDbEntity } from './basedb.entity';

@Entity()
export class User extends BaseDbEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  dob: Date;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip: string;

  @Column()
  country: string;

  @Column()
  linkedin: string;

  @Column()
  github: string;

  @Column()
  twitter: string;

  @Column()
  portfolio: string;

  @Column()
  title: string;

  @Column()
  meta: string;

  @Column()
  company: string;

  @Column()
  subscribed: boolean;

  @Column()
  onboardingType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}