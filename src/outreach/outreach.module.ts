import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from 'src/entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Outreach } from 'src/entity/outreach.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Outreach]),
    forwardRef(() => AuthModule), // <-- Use forwardRef() here
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
