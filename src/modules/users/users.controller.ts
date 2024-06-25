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
import { ResultData } from '../../core/result';

@ApiTags('用户')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'checkLogin' })
  @Post()
  async checkLogin(@Req() request: Request) {
    try {
      const id = request[REQUEST_USER_KEY].id;
      const result = await this.usersService.checkLogin(id);

      return ResultData.success(result);
    } catch (error) {
      return ResultData.fail(error);
    }
  }
}
