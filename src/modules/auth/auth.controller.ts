import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register';
import { Public } from './decorators/public.decorator';
import { ResultData } from '../../core/result';

@ApiTags('用户')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'register' })
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);

      return ResultData.success(result);
    } catch (error) {
      return ResultData.fail(error);
    }
  }

  @ApiOperation({ summary: 'login' })
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);

      return ResultData.success(result);
    } catch (error) {
      return ResultData.fail(error);
    }
  }
}
