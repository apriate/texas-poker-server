import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResultCode } from '../../interfaces/IResult';

@Catch()
// 接口异常拦截器
export class CommonException implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      code: ResultCode.FAIL,
      msg: exception.message,
      data: {},
    });
  }
}
