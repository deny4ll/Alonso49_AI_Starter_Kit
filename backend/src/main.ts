import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const gateUser = process.env.GATE_USER;
  const gatePassword = process.env.GATE_PASSWORD;
  if (gateUser && gatePassword) {
    const expected = Buffer.from(`${gateUser}:${gatePassword}`).toString('base64');
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'OPTIONS') return next();
      const header = req.header('x-gate-auth') || '';
      if (header === `Basic ${expected}`) return next();
      res.status(401).json({ message: 'Acceso restringido' });
    });
  }

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SAILVEX API')
    .setDescription('API para plataforma de entrenamiento de alto rendimiento en vela olímpica')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
