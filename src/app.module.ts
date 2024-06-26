import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { OutreachModule } from './outreach/outreach.module';
import { MailBoxModule } from './mailbox/mailbox.module';
import { ClientModule } from './client/client.module';
import { EmailModule } from './email/email.module';

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
          ssl: {
            rejectUnauthorized: false, // Adjust this based on your SSL requirements
          },
          synchronize: false,
        });
      },
      inject: [ConfigService], 
    }),
    CacheModule.register(),
    AuthModule,
    UserModule,
    OutreachModule,
    MailBoxModule,
    ClientModule,
    EmailModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
