import {
  Inject,
  Injectable,
  NestInterceptor,
  CallHandler,
  HttpStatus,
  ExecutionContext,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Request, Response } from 'express';
import { ResultData } from '../result';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { getReqestMainInfo } from '../../utils/get-request-main-info';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResultData> {
    // 因为nestjs使用REST API风格，对于post请求默认返回201，所以需要手动处理成200
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    if (
      request.method === 'POST' &&
      response.statusCode === HttpStatus.CREATED
    ) {
      response.status(HttpStatus.OK);
    }

    return next.handle().pipe(
      map((data: ResultData) => {
        // 记录日志（相应数据）
        this.logger.info('response', {
          responseData: data,
          req: getReqestMainInfo(request),
        });

        return data;
      }),
    );
  }
}
