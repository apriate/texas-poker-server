import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../../entities/Player';
import { IPlayerDTO, UpdatePlayerDTO } from '../../interfaces/IPlayer';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async add(player: IPlayerDTO) {
    // 转换数据类型
    const entities = new Player({
      ...player,
      roomNumber: String(player.roomNumber),
      userId: Number(player.userId),
    });
    const newPlayer = this.playerRepository.create(entities);
    const palyerInfo = await this.playerRepository.save(newPlayer);

    console.log('XXX --- XXX: player add', palyerInfo);
    return palyerInfo;
  }

  async update(updatePlayer: UpdatePlayerDTO) {
    const row = {
      counter: updatePlayer.counter,
    };
    const result = await this.playerRepository.update(
      updatePlayer.playerId,
      row,
    );
    console.log('XXX --- XXX: player update', result);
    return result;
  }

  async findByRoomNumber(roomNumber: string): Promise<Player[]> {
    const result = await this.playerRepository.find({ where: { roomNumber } });
    console.log('XXX --- XXX: player findByRoomNumber', result);
    return result ? JSON.parse(JSON.stringify(result)) : [];
  }
}
