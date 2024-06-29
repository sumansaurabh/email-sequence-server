// src/users/user.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, LoginUserDto } from 'src/auth/auth.dto';
import { User } from 'src/entity/user.entity';

@Injectable()
export class UserService {
  saltOrRounds: number = 10;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltOrRounds);
  }

  async signup(createUserDto: CreateUserDto): Promise<User> {
    const encodedPassword = await this.hashPassword(createUserDto.password);
    createUserDto.password = encodedPassword;
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const { email, password } = loginUserDto;
    return await this.validateUser(email, password);
  }

  async findOneById(id: number): Promise<User> {
    return await this.userRepository.findOneById(id);
  }
}
