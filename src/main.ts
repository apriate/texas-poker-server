import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MyIoAdapter } from './modules/io/adapter/my-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const myIoAdapter = new MyIoAdapter(app);
  await myIoAdapter.connectToRedis();

  app.enableCors();
  app.useWebSocketAdapter(myIoAdapter);

  // 设置swagger文档
  const config = new DocumentBuilder()
    .setTitle('Texas Poker')
    .setDescription('Texas Poker API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apis', app, document);

  await app.listen(3000);
}

bootstrap();
