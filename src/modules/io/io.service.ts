import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CreateIoDto } from './dto/create-io.dto';
import { UpdateIoDto } from './dto/update-io.dto';

import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class IoService {
  constructor(private readonly usersService: UsersService) {}

  create(createIoDto: CreateIoDto) {
    return 'This action adds a new io';
  }

  findAll() {
    return `This action returns all io`;
  }

  findOne(id: number) {
    return `This action returns a #${id} io`;
  }

  update(id: number, updateIoDto: UpdateIoDto) {
    return `This action updates a #${id} io`;
  }

  remove(id: number) {
    return `This action removes a #${id} io`;
  }
}
