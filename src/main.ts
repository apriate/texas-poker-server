import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { CommonExceptionFilter } from './common/filter/exception.filter';
import { MyValidatePipe } from './common/pipe/validate.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new CommonExceptionFilter());
  app.useGlobalPipes(new MyValidatePipe({ transform: true }));

  // 设置swagger文档
  const config = new DocumentBuilder()
    .setTitle('Texas Poker')
    .setDescription('Texas Poker后台接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}

bootstrap();
