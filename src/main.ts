import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
// import { setupEmailScheduler } from './scheduler';
// import { EmailService } from './email/email.service';
import { ConfigService } from './config/configuration';

async function bootstrap() {
  const configService = new ConfigService();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // const emailService = app.get(EmailService);
  // setupEmailScheduler(emailService);
  const port = configService.get('PORT') || 3000;

  await app.listen(port);
}
bootstrap();
