import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Outreach } from 'src/entity/outreach.entity';
import { OutreachController } from './outreach.controller';
import { OutreachService } from './outreach.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Outreach]),
    forwardRef(() => AuthModule), // <-- Use forwardRef() here
    forwardRef(() => UserModule), // Use forwardRef for potential circular dependency
  ],
  providers: [OutreachService],
  controllers: [OutreachController],
  exports: [OutreachService, TypeOrmModule],
})
export class UserModule {}
