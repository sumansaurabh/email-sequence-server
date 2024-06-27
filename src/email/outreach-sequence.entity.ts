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
    client_id: number;
}
  