import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
  } from 'typeorm';
  
  @Entity()
  export class OutReachSequence {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Index()
    @Column()
    name: string;
    
    @Index()
    @Column()
    user_id: number;

    @Column()
    client_id: number;
}
  