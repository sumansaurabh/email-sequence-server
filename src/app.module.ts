import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log("DB_HOST: ", configService.get<string>('DB_HOST'))
        console.log("DB_PORT: ", configService.get<number>('DB_PORT'))
        console.log("DB_USERNAME: ", configService.get<string>('DB_USERNAME'))
        console.log("DB_PASSWORD: ", configService.get<string>('DB_PASSWORD'))
        console.log("DB_DATABASE: ", configService.get<string>('DB_DATABASE'))
        return ({
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [__dirname + '/**/entity/*.entity{.ts,.js}'],
          synchronize: true,
        });
      },
      inject: [ConfigService], 
    }),
    AuthModule,
    UserModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
