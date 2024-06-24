import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { ResultData } from 'src/utils/common/result';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async checkLogin(id: number) {
    const results = await this.userRepository.findOne({ where: { id } });

    return ResultData.success({ ...results });
  }
}
