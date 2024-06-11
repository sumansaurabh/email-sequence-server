import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recipient: string;

  @Column()
  subject: string;

  @Column()
  body: string;

  @Column({ default: false })
  delivered: boolean;

  @Column({ nullable: true })
  deliveryStatus: string;

  @Column({ default: false })
  opened: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
