import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './utils/common/transform.interceptor';
import { CommonException } from './utils/common/common.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new CommonException());
  await app.listen(3000);
}
bootstrap();
