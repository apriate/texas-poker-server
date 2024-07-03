import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ICommandRecord } from '../../interfaces/ICommandRecord';
import { CommandRecord } from '../../entities/CommandRecord';

@Injectable()
export class CommandRecordService {
  constructor(
    @InjectRepository(CommandRecord)
    private readonly commandRecordRepository: Repository<CommandRecord>,
  ) {}

  async add(commandRecord: ICommandRecord) {
    // 转换数据类型
    const entities = new CommandRecord({
      ...commandRecord,
      userId: Number(commandRecord.userId),
    });
    const newGame = this.commandRecordRepository.create(entities);
    const gameInfo = await this.commandRecordRepository.save(newGame);

    if (gameInfo) {
      return { succeed: !!gameInfo, id: gameInfo.id };
    }
  }

  async findByGameId(gameId: number): Promise<ICommandRecord[]> {
    const result = await this.commandRecordRepository.query(
      'SELECT\n' +
        '\tcommand_record.counter,\n' +
        '\tcommand_record.gameStatus,\n' +
        '\tcommand,\n' +
        '\thandCard,\n' +
        '\ttype,\n' +
        '\tcommonCard,\n' +
        '\tpot,\n' +
        '\tcommand_record.userId,\n' +
        '\t`user`.nickName\n' +
        'FROM\n' +
        '\tcommand_record\n' +
        'INNER JOIN `user` ON `user`.id = command_record.userId\n' +
        'INNER JOIN player ON player.userId = command_record.userId\n' +
        '\twhere command_record.gameId = ? and player.gameId = ?',
      [gameId, gameId],
    );

    return JSON.parse(JSON.stringify(result));
  }

  async findByGameIds(ids: number[]): Promise<ICommandRecord[]> {
    const result = await this.commandRecordRepository.find({
      where: {
        gameId: In(ids),
      },
    });
    console.log('XXX --- XXX: findByGameIds', result);

    return JSON.parse(JSON.stringify(result));
  }

  async findPast7DayGameIds(userId: number): Promise<number[]> {
    const result = await this.commandRecordRepository.query(
      'SELECT\n' +
        '\tDISTINCT gameId\n' +
        '\tFROM command_record\n' +
        '\tWHERE userId = ?\n' +
        '\tAND create_time >= DATE_SUB(now(),interval 7 DAY)',
      [userId],
    );
    console.log('XXX --- XXX: findPast7DayGameIds', userId, result);
    const recordList = JSON.parse(JSON.stringify(result));

    if (recordList) {
      return recordList.map((item: ICommandRecord) => {
        return item.gameId;
      });
    }

    return [];
  }
}
