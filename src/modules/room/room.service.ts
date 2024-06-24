import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../entities/Room';
import { CreateRoomDTO } from './dto/create.room.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(createRoomDTO: CreateRoomDTO) {
    try {
      const { time } = createRoomDTO;
      const number = String(
        Math.floor(Math.random() * (1000000 - 100000)) + 100000,
      );
      const room = await this.roomRepository.create(createRoomDTO);
      console.log('XXX --- XXX: room', room);

      const result = await this.roomRepository.save({
        ...room,
        roomNumber: number,
      });
      console.log('XXX --- XXX: ', result);
      return result;
      // const roomRedis = await this.redis.set(
      //   `room:${number}`,
      //   `${number}`,
      //   'ex',
      //   expires,
      // );
      // if (result.affectedRows === 1 && roomRedis === 'OK') {
      //   return { roomNumber: number };
      // } else {
      //   throw 'room add error';
      // }
    } catch (error) {
      throw new Error(error);
    }

    return 'create room error';
  }

  find(createrRoomDTO: CreateRoomDTO) {
    return 'create room error';
  }
}
