import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
// import { setupEmailScheduler } from './scheduler';
// import { EmailService } from './email/email.service';
import { ConfigService } from './config/configuration';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NextFunction } from 'express';

/**
 * Asynchronous function to bootstrap the application.
 * This function initializes the application with necessary configurations and starts listening on the specified port.
 * @throws {Error} If there is an issue during the bootstrap process.
 */
async function bootstrap() {
  const configService = new ConfigService();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix('api');
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log('Request Headers:', req.headers);
    next();
  });

  // setupEmailScheduler(emailService);
  const port = configService.get('PORT') || 3000;
  console.log("PORT: ", port)
  await app.listen(port, '0.0.0.0');
}
bootstrap();
