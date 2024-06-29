// // src/auth/jwt.strategy.ts
// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, ExtractJwt } from 'passport-jwt';
// import { AuthService } from './auth.service';
// import { JwtPayloadDto } from './auth.dto';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private readonly authService: AuthService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: process.env.SECRET_KEY, // Use environment variables to store secrets in production
//     });
//   }

//   async validate(payload: JwtPayloadDto) {
//     return this.authService.validateJwtPayload(payload);
//   }
// }
