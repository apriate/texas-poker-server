import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';
import { IoGateway } from './io.gateway';
import { IoService } from './io.service';
import { UsersModule } from '../users/users.module';
import { RoomModule } from '../room/room.module';
import { RedisModule } from '../redis/redis.module';
import { GameModule } from '../game/game.module';
import { PlayerModule } from '../player/player.module';
import { CommandRecordModule } from '../command-record/command-record.module';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    UsersModule,
    RoomModule,
    RedisModule,
    GameModule,
    PlayerModule,
    CommandRecordModule,
  ],
  providers: [IoGateway, IoService],
})
export class IoModule {}
