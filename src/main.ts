import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { loggerMiddleware } from './logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(loggerMiddleware);
  app.useGlobalPipes(new ValidationPipe({ validationError: { target: true, value: true } }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
