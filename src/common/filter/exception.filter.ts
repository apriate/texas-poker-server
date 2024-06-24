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

    // 针对参数校验错误的处理
    if (exception instanceof BadRequestException) {
      const responseData = exception.getResponse() as any;
      const newResponseData = {
        code: ResultCode.FAIL,
        data: {},
        msg: responseData.message.map((item) => {
          const arr = item.split('-');
          if (arr.length > 1) {
            return {
              field: arr[0],
              message: arr[1],
            };
          }
          return item;
        }),
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
