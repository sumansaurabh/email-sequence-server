import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { BaseDbEntity } from '../entity/basedb.entity';
import { IsEmail } from 'class-validator';

@Entity()
@Index(['email', 'userId'], { unique: true })
export class Client extends BaseDbEntity{
  
  @Index({ unique: true })
  @IsEmail()
  @Column()
  email: string;

  @Index()
  @Column()
  userId: number;

  @Column({ nullable: true})
  firstName: string;

  @Column({ nullable: true})
  lastName: string;

  @Column({ nullable: true})
  dob: Date;

  @Column({ nullable: true})
  phone: string;

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

  @Column('simple-json', { nullable: true })
  address: { street: string; city: string; state: string };

}