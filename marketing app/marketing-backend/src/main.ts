import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); //  Required to parse cookies
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Marketing API')
    .setDescription('API documentation for the Marketing Backend')
    .setVersion('1.0')
    .addCookieAuth('access_token', {
      name: 'access_token',
      type: 'apiKey',
      in: 'cookie',
      description: 'Access token for authentication',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      withCredentials: true, //  Allow cookies to be sent with requests
    },
  });

  await app.listen(3000);
}
bootstrap().catch((err) => {
  console.error('Error starting app:', err);
});
