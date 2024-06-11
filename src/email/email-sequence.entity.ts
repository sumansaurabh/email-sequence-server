import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Email } from './email.entity';

@Entity()
export class EmailSequence {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Email)
  email: Email;

  @Column()
  sequenceName: string;

  @Column()
  daysAfterPrevious: number;

  @Column({ default: false })
  sent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
