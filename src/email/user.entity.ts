import {
    Entity,
    Column,
    Index,
  } from 'typeorm';
  import { BaseDbEntity } from './basedb.entity';
  
  @Entity()
  export class User extends BaseDbEntity{
  
    @Index({ unique: true })
    email: string;
    
    @Column()
    password: string;

    @Column({ nullable: true})
    firstName: string;
  
    @Column({ nullable: true})
    lastName: string;
  
    @Column({ nullable: true})
    dob: Date;
  
    @Column({ nullable: true})
    phone: string;
  
    @Column("simple-json", { nullable: true})
    address: { street: string, city: string, state: string };
  
    @Column({ nullable: true})
    zip: string;
  
    @Column({ nullable: true})
    country: string;

    @Column({ nullable: true})
    googleSignIn: string;

    @Column({ nullable: true})
    linkedSignIn: string;

    @Column({ nullable: true})
    signupType: string;

    @Index()
    @Column()
    isActive: boolean;
}