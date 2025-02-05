import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { withNestjsListen, withNestjsRepairDecimal, withNestjsSwagger } from './bootstrap';
import { ConfigModule } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  withNestjsRepairDecimal(app)
  withNestjsSwagger(app)
  withNestjsListen(app, 3000)
}
bootstrap();
