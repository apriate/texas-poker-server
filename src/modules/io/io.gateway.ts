import {
  Injectable,
  UseGuards,
  UseFilters,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import { IoExceptionFilter } from './filter/io-exception.filter';
import { IoAuthGuard } from './guard/io-auth.guard';

import { IoService } from './io.service';
import { parseMsg } from '../../utils/helper';

import { CreateIoDto } from './dto/create-io.dto';
import { UpdateIoDto } from './dto/update-io.dto';

import { ITickMsg } from '../../interfaces/ITickMsg';
import { RoomService } from '../room/room.service';
import { UsersService } from '../../modules/users/users.service';
import { User } from 'src/entities/User';
import { IGameRoom, IRoomInfo } from 'src/interfaces/IGameRoom';
import { Room } from 'src/entities/Room';
import { IPlayerDTO } from 'src/interfaces/IPlayer';
import { IPlayer } from 'src/utils/player';
import { ActiveUser } from 'src/interfaces/IActiveUser';

@Injectable()
@UseFilters(new IoExceptionFilter())
@UseGuards(new IoAuthGuard(new JwtService()))
@WebSocketGateway({
  cors: true,
  transports: ['websocket'],
  namespace: '/socket',
})
export class IoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly ioService: IoService,
    private readonly roomService: RoomService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  io: Server;

  public gameRooms = [];

  // socket 初始化
  async afterInit(socket: Socket) {
    console.log('afterInit');
  }

  // socket 连接
  async handleConnection(socket: Socket) {
    console.log(`Cliend id:${socket.id} connected`);
    try {
      await this.connectAuth(socket);
      await this.connectJoin(socket);
      await this.connectLeave();
    } catch (e) {
      console.log('connect error', e.message);
    }
  }

  // socket 断开
  async handleDisconnect(socket: Socket) {
    console.log(`Cliend id:${socket.id} disconnected`);
  }

  // 获取用户信息
  async getUserInfo(token): Promise<ActiveUser> {
    if (!token) {
      throw new WsException('error, token is require');
    }

    const user = await this.jwtService.decode(token as string);

    if (!user) {
      throw new UnauthorizedException();
    }
    console.log('getUserInfo ', user);
    return user;
  }

  // 获取房间信息
  async getRoomInfo(room: string): Promise<IRoomInfo> {
    const roomInfo = this.gameRooms.find((gr: IGameRoom) => gr.number === room);
    return roomInfo.roomInfo;
  }

  adapter(room: string, type: string, actionName: string, data: any) {
    return new Promise((resolve) => {
      this.io.to(room).emit(type, {
        action: actionName,
        target: 'participator',
        data,
      });
      resolve(null);
    });
  }

  protected async updateGameInfo(socket: Socket) {
    const query = socket.handshake.query;
    const { room } = query;
    const roomInfo = await this.getRoomInfo(room as string);
    console.log(roomInfo, 'roomInfo ===============================');
    if (
      (roomInfo.game && roomInfo.game.status < 6) ||
      (roomInfo.game?.status === 6 && roomInfo.game.playerSize === 1)
    ) {
      roomInfo.players.forEach((p) => {
        const currPlayer =
          roomInfo.game &&
          roomInfo.game
            .getPlayers()
            .find((player) => player.userId === p.userId);
        p.counter = currPlayer?.counter || p.counter;
        p.type = currPlayer?.type || '';
        p.status = currPlayer ? 1 : p.status === -1 ? -1 : 0;
        p.actionCommand = (currPlayer && currPlayer.actionCommand) || '';
        p.delayCount = (currPlayer && currPlayer.delayCount) || 0;
        p.actionSize = (currPlayer && currPlayer.actionSize) || 0;
      });
      console.log(roomInfo.players, 'roomInfo.players =========== 33');
      const gameInfo = {
        players: roomInfo.players.map((p) => {
          const currPlayer = roomInfo.game?.allPlayer.find(
            (player) => player.userId === p.userId,
          );
          return Object.assign(
            {},
            {
              counter: currPlayer?.counter || p.counter,
              actionSize: currPlayer?.actionSize || 0,
              actionCommand: currPlayer?.actionCommand || '',
              nickName: p.nickName,
              type: currPlayer?.type || '',
              status: p.status || 0,
              userId: p.userId,
              buyIn: p.buyIn || 0,
              delayCount: currPlayer?.delayCount || 0,
            },
            {},
          );
        }),
        pot: roomInfo.game.pot,
        prevSize: roomInfo.game.prevSize,
        sitList: roomInfo.sit,
        actionEndTime: roomInfo.game.actionEndTime,
        currPlayer: {
          userId: roomInfo.game.currPlayer.node.userId,
        },
        smallBlind: roomInfo.config.smallBlind,
      };
      console.log('gameInfo ==========', gameInfo);
      await this.adapter(room as string, 'online', 'gameInfo', gameInfo);
    }
  }

  // 连接时auth鉴权
  async connectAuth(socket: Socket) {
    const id = socket.id;
    const query = socket.handshake.query;
    const { room, token } = query;

    function tick(id: string, msg: ITickMsg, socket: any) {
      // 踢出用户前发送消息
      socket.emit(id, parseMsg('deny', msg));
      return socket.disconnect(true);
    }

    try {
      // token 鉴权
      await this.getUserInfo(token as string);

      // 检查房间是否存在，不存在则踢出用户
      const hasRoom = await this.roomService.hasRoomNumber(room as string);
      if (!hasRoom) {
        tick(
          id,
          {
            type: 'deleted',
            message: 'deleted, room has been deleted.',
          },
          socket,
        );
        return;
      }
      console.log('play------------', room);
    } catch (e) {
      console.log(e);
      tick(
        id,
        {
          type: 'deleted',
          message: 'deleted, room has been deleted.',
        },
        socket,
      );
      return;
    }
  }

  // 连接时加入房间
  async connectJoin(socket: Socket) {
    function updatePlayer(roomNumber: string, players: any, action: string) {
      // 更新在线用户列表
      this.adapter(roomNumber, 'online', action, {
        data: {
          players,
        },
      });
    }

    const id = socket.id;
    const query = socket.handshake.query;
    const { room, token, roomConfig } = query;
    console.log('socket-----join', id);
    console.log('roomConfig-----roomConfig', JSON.parse(roomConfig as string));
    // room缓存信息是否存在
    if (!this.gameRooms) {
      this.gameRooms = [];
    }
    try {
      const hasRoom = this.gameRooms.find((r: IGameRoom) => r.number === room);
      const user = await this.getUserInfo(token as string);
      socket.join(room);
      await socket.emit(id, parseMsg('userInfo', { userInfo: user }));
      const player: IPlayer = {
        ...user,
        socketId: id,
        counter: 0,
        buyIn: 0,
        delayCount: 3,
        reBuy: 0,
        type: '',
        status: 0,
        actionSize: 0,
        actionCommand: '',
      };
      let gameRoom: IGameRoom = {
        number: room as string,
        roomInfo: {
          sit: [],
          players: [],
          game: null,
          sitLink: null,
          config: JSON.parse(roomConfig as string) || {
            isShort: false,
            smallBlind: 1,
          },
        },
      };
      if (!hasRoom) {
        // not in the room
        this.gameRooms.push(gameRoom);
        gameRoom.roomInfo = {
          sit: [],
          players: [player],
          game: null,
          sitLink: null,
          config: JSON.parse(roomConfig as string) || {
            isShort: false,
            smallBlind: 1,
          },
        };
        updatePlayer(room as string, gameRoom.roomInfo.players, 'players');
      } else {
        // in the room
        gameRoom = this.gameRooms.find((r: IGameRoom) => r.number === room);
        const findPlayer = gameRoom.roomInfo.players.find(
          (p: IPlayer) => p.userId === user.userId,
        );
        if (!findPlayer) {
          // game ready
          gameRoom.roomInfo.players.push(player);
          updatePlayer(room as string, gameRoom.roomInfo.players, 'players');
        } else {
          // gaming, update hand cards
          findPlayer.socketId = id;
          const gamePlayer = gameRoom.roomInfo.game?.allPlayer.find(
            (p) => user.userId === p.userId,
          );
          if (gamePlayer) {
            // in the game, get hand card
            const msg = parseMsg(
              'handCard',
              {
                handCard: gamePlayer.getHandCard(),
              },
              { client: id },
            );
            socket.emit(id, msg);
          }
          if (gameRoom.roomInfo) {
            const roomInfo = gameRoom.roomInfo;
            const gameInfo = {
              players: roomInfo.players.map((p) => {
                const currPlayer = roomInfo.game?.allPlayer.find(
                  (player) => player.userId === p.userId,
                );
                console.log('currPlayer ========== ', currPlayer);
                return Object.assign(
                  {},
                  {
                    counter: currPlayer?.counter || p.counter,
                    actionSize: currPlayer?.actionSize || 0,
                    actionCommand: currPlayer?.actionCommand || '',
                    nickName: p.nickName,
                    type: currPlayer?.type || '',
                    userId: p.userId,
                    status: p.status,
                    buyIn: p.buyIn || 0,
                  },
                  {},
                );
              }),
              commonCard: roomInfo.game?.commonCard || [],
              pot: roomInfo.game?.pot || 0,
              prevSize: roomInfo.game?.prevSize || 0,
              currPlayer: {
                userId: roomInfo.game?.currPlayer.node.userId,
              },
              smallBlind: roomInfo.config.smallBlind,
              actionEndTime: roomInfo.game?.actionEndTime || 0,
            };
            const game = parseMsg(
              'gameInfo',
              {
                data: gameInfo,
              },
              { client: id },
            );
            socket.emit(id, game);
          }
        }
        // get sitList
        const msg = parseMsg(
          'sitList',
          {
            sitList: gameRoom.roomInfo.sit,
          },
          { client: id },
        );
        socket.emit(id, msg);
      }
      // console.log('players', JSON.stringify(gameRoom.roomInfo.players));
      updatePlayer(room as string, `User(${user.nickName}) joined.`, 'join');
    } catch (e) {
      throw e;
    }
  }

  // 离开房间
  connectLeave() {}

  @SubscribeMessage('exchange')
  exchange(@MessageBody() message: any, @ConnectedSocket() socket: Socket) {
    try {
      const nsp = this.io.of('/socket');
      const { target, payload } = message;
      const client = socket.id;

      if (!target) return;

      const msg = parseMsg('exchange', payload, { client, target });
      nsp.emit(target, msg);
    } catch (error) {
      console.log('XXX --- XXX: error', error);
      // TODO logger
    }
  }

  @SubscribeMessage('broadcast')
  broadcast(@MessageBody() body: any, @ConnectedSocket() socket: Socket) {
    try {
      const { room } = socket.handshake.query;
      const { payload } = body;

      this.io.to(room).emit('online', {
        action: 'broadcast',
        target: 'participator',
        message: payload,
      });
    } catch (error) {
      console.log('XXX --- XXX: error', error);
      // TODO logger
    }
  }

  @SubscribeMessage('buyIn')
  handleMessage(@MessageBody() body: any, @ConnectedSocket() socket: Socket) {
    console.log('XXX --- XXX: buyInDto', body);
    this.io.emit('online', {
      message: 'online message',
      content: body.payload,
    });
  }

  @SubscribeMessage('createIo')
  create(@MessageBody() createIoDto: CreateIoDto) {
    return this.ioService.create(createIoDto);
  }

  @SubscribeMessage('findAllIo')
  findAll() {
    return this.ioService.findAll();
  }

  @SubscribeMessage('findOneIo')
  findOne(@MessageBody() id: number) {
    return this.ioService.findOne(id);
  }

  @SubscribeMessage('updateIo')
  update(@MessageBody() updateIoDto: UpdateIoDto) {
    return this.ioService.update(updateIoDto.id, updateIoDto);
  }

  @SubscribeMessage('removeIo')
  remove(@MessageBody() id: number) {
    return this.ioService.remove(id);
  }
}
