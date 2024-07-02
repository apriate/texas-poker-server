import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class IoExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient() as Socket;
    const error =
      exception instanceof WsException ? exception.getError() : exception;
    const data = {
      message: error,
      data: {},
    };

    client.emit('error', data);
    // TODO 添加日志
    // super.catch(exception, host);
  }
}
