import { Module } from '@nestjs/common';
import { CommandRecordService } from './command-record.service';
import { CommandRecordController } from './command-record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommandRecord } from '../../entities/CommandRecord';
import { GameModule } from '../game/game.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommandRecord]), GameModule],
  controllers: [CommandRecordController],
  providers: [CommandRecordService],
  exports: [CommandRecordService],
})
export class CommandRecordModule {}
