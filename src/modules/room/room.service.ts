import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Room } from '../../entities/Room';
import { CreateRoomDTO } from './dto/create.room.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  @Inject(RedisService)
  private redisService: RedisService;

  async create(createRoomDTO: CreateRoomDTO): Promise<{ roomNumber: string }> {
    const { time } = createRoomDTO;
    const roomNumber = String(
      Math.floor(Math.random() * (1000000 - 100000)) + 100000,
    );

    const room = await this.roomRepository.create(createRoomDTO);
    const result = await this.roomRepository.save({
      ...room,
      roomNumber,
    });

    const roomRedis = await this.redisService.set(
      `room:${roomNumber}`,
      `${roomNumber}`,
      time,
    );

    if (result && roomRedis === 'OK') {
      return { roomNumber };
    } else {
      throw 'room add error';
    }
  }

  async findRoomNumber(number: string): Promise<Room> {
    const result = await this.roomRepository.findOne({
      where: { roomNumber: number },
    });

    if (!result) throw 'invalid room';

    return result;
  }

  async findById(uid: number): Promise<Room> {
    return await this.roomRepository.findOne({ where: { id: uid } });
  }

  async hasRoomNumber(number: string): Promise<boolean> {
    const roomNumber = await this.redisService.get(`room:${number}`);
    return !!roomNumber;
  }
}
