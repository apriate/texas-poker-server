import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICommandRecord } from '../../interfaces/ICommandRecord';
import { CommandRecord } from '../../entities/CommandRecord';

import { CreateCommandRecordDto } from './dto/create-command-record.dto';
import { UpdateCommandRecordDto } from './dto/update-command-record.dto';

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

    console.log('XXX --- XXX: game add', gameInfo);
    if (gameInfo) {
      return { succeed: !!gameInfo, id: gameInfo.id };
    }
  }

  create(createCommandRecordDto: CreateCommandRecordDto) {
    return 'This action adds a new commandRecord';
  }

  findAll() {
    return `This action returns all commandRecord`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commandRecord`;
  }

  update(id: number, updateCommandRecordDto: UpdateCommandRecordDto) {
    return `This action updates a #${id} commandRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} commandRecord`;
  }
}
