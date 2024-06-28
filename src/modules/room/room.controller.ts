import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDTO } from './dto/create.room.dto';
import { FindRoomDTO } from './dto/find.room.dto';
import { ResultData } from '../../core/result';

import { AppLoggerService } from '../logger/logger.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('game/room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService, // 注入日志
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(RoomController.name);
  }

  @Post('/')
  async create(@Body() createRoomDTO: CreateRoomDTO) {
    try {
      const result = await this.roomService.create(createRoomDTO);

      return ResultData.success(result);
    } catch (error) {
      return ResultData.fail(error);
    }
  }

  @Post('/find')
  async findRoomNumber(@Body() findRoomDTO: FindRoomDTO) {
    try {
      const { roomNumber } = findRoomDTO;

      const result = await this.roomService.findRoomNumber(roomNumber);

      // 测试日志
      this.logger.info(null, 'find room success');
      return ResultData.success(result);
    } catch (error) {
      // 测试日志
      this.logger.error(null, 'find room error', { error });
      return ResultData.fail(error);
    }
  }
}
