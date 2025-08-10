import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { initializeDatabase } from './database/data-source';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    await initializeDatabase();
    console.log('✅ Database connection test successful');
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Configure cookie parser
  app.use(cookieParser());

  // Configure global validation pipe with strict property validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Only allow properties that are decorated with validation decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are provided
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable automatic type conversion
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
