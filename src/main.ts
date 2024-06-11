import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { setupEmailScheduler } from './scheduler';
import { EmailService } from './email/email.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const emailService = app.get(EmailService);
  setupEmailScheduler(emailService);

  await app.listen(3000);
}
bootstrap();
