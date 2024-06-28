import { Injectable, Inject } from '@nestjs/common';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AppLoggerService {
  private context?: string;

  public setContext(context: string): void {
    this.context = context;
  }

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  error(ctx: any, message: string, meta?: Record<string, any>): Logger {
    return this.logger.error({
      message,
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }

  warn(ctx: any, message: string, meta?: Record<string, any>): Logger {
    return this.logger.warn({
      message,
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }

  debug(ctx: any, message: string, meta?: Record<string, any>): Logger {
    return this.logger.debug({
      message,
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }

  info(ctx: any, message: string, meta?: Record<string, any>): Logger {
    return this.logger.info({
      message,
      contextNmae: this.context,
      ctx,
      ...meta,
    });
  }
}
