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
import { ResultData } from '../..//core/result';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('game/room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

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
      return ResultData.success(result);
    } catch (error) {
      return ResultData.fail(error);
    }
  }
}
