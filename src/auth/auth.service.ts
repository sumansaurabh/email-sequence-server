// // src/auth/auth.service.ts
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { UserService } from '../users/user.service';
// import { User } from '../../vkp/user.entity';
// import { JwtPayloadDto, LoginUserDto } from './auth.dto';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly userService: UserService,
//     private readonly jwtService: JwtService,
//   ) {}

//   async validateUser(email: string, pass: string): Promise<User> {
//     const user = await this.userService.validateUser(email, pass);
//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }
//     return user;
//   }

//   async login(user: LoginUserDto) {
//     const validatedUser = await this.validateUser(user.email, user.password);
//     const payload = { username: validatedUser.email, sub: validatedUser.id };
//     return {
//       access_token: this.jwtService.sign(payload),
//     };
//   }

//   async validateJwtPayload(payload: JwtPayloadDto): Promise<User> {
//     const user = await this.userService.findOneById(payload.sub);
//     if (!user) {
//       throw new UnauthorizedException('Invalid token');
//     }
//     return user;
//   }
// }
