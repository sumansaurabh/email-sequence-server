import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/users/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from 'src/users/user.service';

@Module({
  imports: [
    forwardRef(() => UserModule), // <-- Use forwardRef() here
    PassportModule,
    JwtModule.register({
      secret: 'EMAIL_SEQUENCE_SERVER_SECRET_PENIFY', // Use environment variables to store secrets in production
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, UserService],
  exports: [AuthService], // <-- Ensure AuthService is exported
})
export class AuthModule {}
