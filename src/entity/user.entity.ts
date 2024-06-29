import { Entity, Column, Index } from 'typeorm';
import { BaseDbEntity } from './basedb.entity';
import { IsEmail } from 'class-validator';
import { Exclude } from 'class-transformer';


export enum UserRole {
    ADMIN = 'ADMIN',
    VIEWER = 'VIEWER',
}

export enum SignupType {
    GOOGLE = 'google',
    EMAIL = 'email',
    LINKEDIN = 'linkedIn',
}

@Entity()
export class User extends BaseDbEntity {

    @Index({ unique: true })
    @IsEmail()
    @Column()
    email: string;

    @Column()
    @Exclude({ toPlainOnly: true })
    password: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    dob: Date;

    @Column({ nullable: true })
    phone: string;

    @Column('simple-json', { nullable: true })
    address: { street: string; city: string; state: string };

    @Column({ nullable: true })
    zip: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    googleSignIn: string;

    @Column({ nullable: true })
    linkedSignIn: string;

    @Column({
        type: 'enum',
        enum: SignupType,
        default: SignupType.EMAIL,
    })
    signupType: SignupType;

    @Index()
    @Column()
    isActive: boolean;

    @Index()
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.VIEWER,
    })
    role: UserRole;
}
