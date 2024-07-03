import { Controller, Post, Body, Req } from '@nestjs/common';
import { CommandRecordService } from './command-record.service';
import { GameService } from '../game/game.service';
import { ICommandRecord } from '../../interfaces/ICommandRecord';
import { FindGameRecordDTO } from './dto/find-game-record.dto';
import { FindCommandRecordDTO } from './dto/find-command-record.dto';
import { ResultData } from '../../core/result';
import { EGameOverType } from '../../utils/poker-game';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../../constants/index';

interface IFindGameRecord {
  gameId: number;
  winners: string;
  commandList: ICommandRecord[];
}

@Controller('game/record')
export class CommandRecordController {
  constructor(
    private readonly commandRecordService: CommandRecordService,
    private readonly gameService: GameService,
  ) {}

  @Post('/find/gameRecord')
  async findGameRecord(@Body() findGameRecordDTO: FindGameRecordDTO) {
    try {
      const { roomNumber } = findGameRecordDTO;
      const gameList = await this.gameService.findByRoomNumber(roomNumber);
      const result = gameList.map((g) => Object.assign({}, { gameId: g.id }));
      return ResultData.success(result);
    } catch (error) {
      console.log('XXX --- XXX: findGameRecord error', error);
      return ResultData.fail('create room error');
    }
  }

  @Post('/find/commandRecord')
  async findCommandRecord(
    @Body() findCommandRecordDTO: FindCommandRecordDTO,
    @Req() request: Request,
  ) {
    try {
      const userId = request[REQUEST_USER_KEY].id;
      const { gameId, roomNumber } = findCommandRecordDTO;

      const commandList = await this.commandRecordService.findByGameId(gameId);
      const gameList = await this.gameService.findByRoomNumber(roomNumber);
      let result: IFindGameRecord;

      gameList.forEach((g) => {
        if (g.status === EGameOverType.GAME_OVER) {
          const winner = JSON.parse(g.winners || '')[0][0];
          delete winner.handCard;
          g.winners = JSON.stringify([[winner]]);
        }
      });

      commandList.forEach((c) => {
        if (c.userId !== userId) {
          c.handCard = '';
        }
      });

      result = {
        commandList,
        winners: gameList.find((g) => g.id === gameId)?.winners || '',
        gameId,
      };

      return ResultData.success(result);
    } catch (error) {
      return ResultData.fail('invalid game record');
    }
  }

  @Post('/find/selfPast7DayGame')
  async selfPast7DayGame(@Req() request: Request) {
    try {
      const userId = request[REQUEST_USER_KEY].id;
      const gameIdList =
        await this.commandRecordService.findPast7DayGameIds(userId);

      if (!gameIdList.length) {
        return ResultData.success([]);
      }

      const gameList = await this.gameService.findByIds(gameIdList);
      const commandList =
        await this.commandRecordService.findByGameIds(gameIdList);

      const result: any = [];
      gameList.forEach((g) => {
        if (g.status === EGameOverType.GAME_OVER) {
          const winner = JSON.parse(g.winners || '')[0][0];
          delete winner.handCard;
          g.winners = JSON.stringify([[winner]]);
        }

        const gameCommandList = commandList.filter((c) => {
          return c.gameId === g.id;
        });

        // 过滤其他人手牌
        gameCommandList.forEach((c) => {
          if (c.userId !== userId || !c.handCard) {
            c.handCard = '';
          }
        });

        result.push({
          gameCommandList,
          winners: g.winners,
          gameId: g.id,
        });
      });

      return ResultData.success(result);
    } catch (error) {
      return ResultData.fail('find self command record error');
    }
  }
}
