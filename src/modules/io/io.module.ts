import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';
import { IoGateway } from './io.gateway';
import { IoService } from './io.service';
import { UsersModule } from '../users/users.module';
import { RoomModule } from '../room/room.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    UsersModule,
    RoomModule,
    RedisModule,
  ],
  providers: [IoGateway, IoService],
})
export class IoModule {}
