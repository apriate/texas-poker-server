import {
  Controller,
  Post,
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../../constants/index';

@ApiTags('用户')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'checkLogin' })
  @Post()
  checkLogin(@Req() request: Request) {
    const id = request[REQUEST_USER_KEY].id;
    return this.usersService.checkLogin(id);
  }
}
