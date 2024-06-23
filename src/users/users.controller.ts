import { Controller, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../utils/constants/index';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  checkLogin(@Req() request: Request) {
    const id = request[REQUEST_USER_KEY].id;
    return this.usersService.checkLogin(id);
  }
}
