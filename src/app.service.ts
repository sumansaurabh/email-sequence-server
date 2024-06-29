import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entity/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcryptjs';

@Injectable()
export class AppService implements OnModuleInit {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.createSuperuser();
  }

  private async createSuperuser() {
    const superuser = await this.userRepository.findOne({ where: { email: 'sumanrocs@gmail.com' } });
    if (!superuser) {
      const password = await hash('alpha_beta_@31a', 10);
      const newSuperuser = this.userRepository.create({
        email: 'sumanrocs@gmail.com',
        password,
        role: UserRole.ADMIN,
        isActive: true,
      });
      await this.userRepository.save(newSuperuser);
      console.log('Superuser created');
    }
    else {
      console.log('Superuser already exists');
    }
  }

  getHello(): string {
    console.log("Hello World app service!")
    return 'Hello World app service!';
  }
}
