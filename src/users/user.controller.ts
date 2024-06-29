// src/users/user.controller.ts
import { Controller, Post, Body, UseGuards, Get, Request, forwardRef, Inject } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, LoginUserDto } from 'src/auth/auth.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/entity/user.entity';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService, // <-- Inject AuthService with forwardRef
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
