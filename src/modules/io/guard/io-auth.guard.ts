import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { getConfig } from '../../../../config/jwt.config';
import * as qs from 'qs';

@Injectable()
export class IoAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const socket = context.switchToWs().getClient();
      const token = qs.parse(socket.request.url)?.token as string;
      const verified =
        token && (await this.jwtService.verifyAsync(token, getConfig()));

      // 校验token 失败报错
      if (!verified) throw new UnauthorizedException();
    } catch (error) {
      throw new WsException(error.message);
    }

    return true;
  }
}
