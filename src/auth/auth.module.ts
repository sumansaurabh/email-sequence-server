import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/users/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from 'src/users/user.service';
import { jwtConstants } from './auth.constants';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UserModule), // <-- Use forwardRef() here
    JwtModule.register({
      secret: jwtConstants.secret, // Use environment variables to store secrets in production
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, UserService],
  exports: [AuthService, PassportModule], // <-- Ensure AuthService is exported
})
export class AuthModule {}
