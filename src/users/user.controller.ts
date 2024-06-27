// src/users/user.controller.ts
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entity/user.entity';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, LoginUserDto } from 'src/auth/auth.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.signup(createUserDto);
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    return await this.authService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
