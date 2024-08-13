import { INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as SocketIO from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import * as qs from 'qs';

export class MyIoAdapter extends IoAdapter {
  private readonly jwtService: JwtService;
  private adapterConstructor: ReturnType<typeof createAdapter>;
  constructor(private app: INestApplicationContext) {
    super(app);
    this.jwtService = this.app.get(JwtService);
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${+process.env.REDIS_PORT}`,
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: SocketIO.ServerOptions): any {
    // !!! 对socket.io 网关中的 handleConnection 在连接时鉴权失败处理
    options.allowRequest = async (request, allowFunction) => {
      const token = qs.parse(request.url)?.token as string;
      const verified = token && (await this.jwtService.verifyAsync(token));

      if (verified) {
        return allowFunction(null, true);
      }

      return allowFunction('Unauthorized', false);
    };

    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
