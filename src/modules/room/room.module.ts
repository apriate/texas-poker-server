import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { Room } from '../../entities/Room';
import { RedisModule } from '../../modules/redis/redis.module';
import { AppLoggerModule } from '../logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), RedisModule, AppLoggerModule],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
