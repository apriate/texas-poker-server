import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Game } from '../../entities/Game';
import { IGame } from 'src/interfaces/IGame';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}

  async add(game: IGame) {
    const newGame = this.gameRepository.create(game);
    const gameInfo = await this.gameRepository.save(newGame);

    if (gameInfo) {
      return { succeed: !!gameInfo, id: gameInfo.id };
    }
  }

  async update(game: IGame) {
    const gameInfo = await this.gameRepository.update(game.id, game);
    return { succeed: !!gameInfo };
  }

  async findById(id: number): Promise<Game> {
    return await this.gameRepository.findOne({ where: { id } });
  }

  async findByIds(ids: number[]): Promise<Game[]> {
    return await this.gameRepository.find({ where: { id: In(ids) } });
  }

  async findByRoomNumber(roomNumber: string): Promise<Game[]> {
    const result = await this.gameRepository.find({ where: { roomNumber } });
    return JSON.parse(JSON.stringify(result));
  }
}
