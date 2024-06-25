import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResultCode } from '../../interfaces/IResult';

@Catch()
// 接口异常拦截器
export class CommonExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // 针对 参数校验错误 的处理
    if (exception instanceof BadRequestException) {
      const responseData = exception.getResponse() as any;
      // 只取最后一个 参数校验错误 的提示
      const msgStr = responseData.message[responseData.message.length - 1];
      const msg = msgStr.split('-')[1];

      const newResponseData = {
        code: ResultCode.FAIL,
        data: {},
        msg,
      };

      // 返回新的错误信息
      return response.status(status).json(newResponseData);
    }

    return response.status(status).json({
      code: status,
      msg: exception.message,
      data: {},
    });
  }
}
