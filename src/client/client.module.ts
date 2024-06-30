import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from '../entity/client.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Client]),
  forwardRef(() => AuthModule), // <-- Use forwardRef() here
  forwardRef(() => UserModule), // Use forwardRef for potential circular dependency
  ],
  providers: [ClientService],
  controllers: [ClientController],
  exports: [ClientService, TypeOrmModule],
})
export class ClientModule {}
