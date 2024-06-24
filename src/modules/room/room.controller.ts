import { Body, Controller, Post } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDTO } from './dto/create.room.dto';

@Controller('game/room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/')
  create(@Body() createRoomDTO: CreateRoomDTO) {
    return this.roomService.create(createRoomDTO);
  }

  @Post('/find')
  find(@Body() createRoomDTO: CreateRoomDTO) {
    return this.roomService.find(createRoomDTO);
  }
}
