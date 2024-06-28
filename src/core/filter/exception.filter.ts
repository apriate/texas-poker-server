import {
  ArgumentsHost,
  Catch,
  Inject,
  ExceptionFilter,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ResultCode } from '../../interfaces/IResult';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { getReqestMainInfo } from '../../utils/get-request-main-info';

@Catch()
// 接口异常拦截器
export class CommonExceptionFilter implements ExceptionFilter {
  // 注入日志服务相关依赖
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    let newResponseData;

    // 针对 参数校验错误 的处理
    if (exception instanceof BadRequestException) {
      const responseData = exception.getResponse() as any;
      // 只取最后一个 参数校验错误 的提示
      const msgStr = responseData.message[responseData.message.length - 1];
      const msg = msgStr.split('-')[1];

      newResponseData = {
        code: ResultCode.FAIL,
        msg,
        data: {},
      };
    } else {
      newResponseData = {
        code: status,
        msg: exception.message,
        data: {},
      };
    }

    // 记录日志（错误消息，错误码，请求信息等）
    this.logger.error(newResponseData, {
      status,
      req: getReqestMainInfo(request),
      // stack: exception.stack,
    });

    // 返回错误信息
    return response.status(status).json(newResponseData);
  }
}
