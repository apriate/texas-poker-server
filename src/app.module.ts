// src/app.module.ts
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import * as Joi from 'joi';
import envConfig from './config/env';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

// 全局
import { TransformInterceptor } from './core/interceptor/transform.interceptor';
import { CommonExceptionFilter } from './core/filter/exception.filter';
import { MyValidatePipe } from './core/pipe/validate.pipe';

// 日志
import { WinstonModule } from 'nest-winston';
import type { WinstonModuleOptions } from 'nest-winston';
import { transports, format } from 'winston';
import 'winston-daily-rotate-file';
import logger from './core/middleware/logger/logger.middleware';

// 模块
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RedisModule } from './modules/redis/redis.module';
import { RoomModule } from './modules/room/room.module';
import { IoModule } from './modules/io/io.module';
import { GameModule } from './modules/game/game.module';
import { PlayerModule } from './modules/player/player.module';
import { CommandRecordModule } from './modules/command-record/command-record.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局
      envFilePath: [envConfig.path],
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(3306),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_TOKEN_AUDIENCE: Joi.string().required(),
        JWT_TOKEN_ISSUER: Joi.string().required(),
        JWT_ACCESS_TOKEN_TTL: Joi.number().default(3600),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
      }),
    }),

    // db
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    // 日志
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // 日志输出的管道
        const transportsList: WinstonModuleOptions['transports'] = [
          new transports.DailyRotateFile({
            level: 'error',
            dirname: `logs`,
            filename: `%DATE%-error.log`,
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
          }),
          new transports.DailyRotateFile({
            dirname: `logs`,
            filename: `%DATE%-combined.log`,
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format: format.combine(
              format((info) => {
                if (info.level === 'error') {
                  return false; // 过滤掉'error'级别的日志
                }
                return info;
              })(),
            ),
          }),
        ];

        // 开发环境下，输出到控制台
        if (configService.get('NODE_ENV') === 'development') {
          transportsList.push(new transports.Console());
        }

        return {
          transports: transportsList,
        };
      },
    }),
    AuthModule,
    UsersModule,
    RedisModule,
    RoomModule,
    IoModule,
    GameModule,
    PlayerModule,
    CommandRecordModule,
  ],
  controllers: [AppController],
  providers: [
    // 全局过滤器
    {
      provide: APP_FILTER,
      useClass: CommonExceptionFilter,
    },
    // 全局拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // 全局管道
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new MyValidatePipe({ transform: true });
      },
    },
    AppService,
  ],
})
export class AppModule {
  // 全局中间件
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
