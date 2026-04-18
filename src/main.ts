import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // This turns on the DTO "Machine"
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Delete fields that aren't in the DTO
      forbidNonWhitelisted: true,
      transform: true, // Convert types automatically
    }),
  );
  app.setGlobalPrefix('api/v1'); // Set a global prefix for all routes

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
