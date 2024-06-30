// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { JwtPayloadDto, LoginUserDto } from './auth.dto';
import { User } from 'src/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.userService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  /**
   * Asynchronously logs in a user.
   * 
   * @param user - The user object containing email and password for login.
   * @returns An object containing access token and user information upon successful login.
   * @throws Error if validation of user fails or signing the JWT token fails.
   */
  async login(user: LoginUserDto) {
    const validatedUser = await this.validateUser(user.email, user.password);
    const payload = { username: validatedUser.email, sub: validatedUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: validatedUser,
    };
  }

  async validateJwtPayload(payload: JwtPayloadDto): Promise<User> {
    const user = await this.userService.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
