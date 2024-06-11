import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { setupEmailScheduler } from './scheduler';
import { EmailService } from './email/email.service';

/**
 * Asynchronous function to bootstrap the application.
 * 
 * This function initializes the NestFastifyApplication by creating an instance of AppModule using FastifyAdapter.
 * It then retrieves the EmailService instance from the application and sets up the email scheduler using setupEmailScheduler.
 * Finally, it starts the application and listens on port 3000.
 * 
 * @throws {Error} If there is an error during the bootstrap process.
 */
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
