import {
  Injectable,
  UseGuards,
  UseFilters,
  UnauthorizedException,
} from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WsException,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket, Server } from 'socket.io';

import { IoExceptionFilter } from './filter/io-exception.filter';
import { IoAuthGuard } from './guard/io-auth.guard';

import { RoomService } from '../room/room.service';
import { ActiveUser } from '../../interfaces/IActiveUser';
import { ITickMsg } from '../../interfaces/ITickMsg';
import { IGameRoom, IRoomInfo, ISit } from '../../interfaces/IGameRoom';
import { IGame } from '../../interfaces/IGame';
import { IPlayerDTO } from '../../interfaces/IPlayer';
import { ICommandRecord } from '../../interfaces/ICommandRecord';

import { parseMsg } from '../../utils/helper';
import { IPlayer } from '../../utils/player';
import { EGameStatus, PokerGame } from '../../utils/poker-game';
import { ILinkNode, Link } from '../../utils/link';

import { IoService } from './io.service';
import { GameService } from '../game/game.service';
import { PlayerService } from '../player/player.service';
import { CommandRecordService } from '../command-record/command-record.service';

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
    private readonly gameService: GameService,
    private readonly playerService: PlayerService,
    private readonly commandRecordService: CommandRecordService,
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
      console.log('connect error', e);
    }
  }

  // socket 断开
  async handleDisconnect(socket: Socket) {
    console.log(`Cliend id:${socket.id} disconnected`);
  }

  // 获取用户信息
  async getUserInfo(token: string): Promise<ActiveUser> {
    if (!token) {
      throw new WsException('error, token is require');
    }

    const user = await this.jwtService.decode(token as string);

    if (!user) {
      throw new UnauthorizedException();
    }
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

  async updateGameInfo(socket: Socket) {
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

  updatePlayer(room: string, players: any, action: string) {
    // 更新在线用户列表
    this.adapter(room, 'online', action, { players });
  }

  // 连接时加入房间
  async connectJoin(socket: Socket) {
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
        this.updatePlayer(room as string, gameRoom.roomInfo.players, 'players');
      } else {
        // in the room
        gameRoom = this.gameRooms.find((r: IGameRoom) => r.number === room);
        const findPlayer = gameRoom.roomInfo.players.find(
          (p: IPlayer) => p.userId === user.userId,
        );
        if (!findPlayer) {
          // game ready
          gameRoom.roomInfo.players.push(player);
          this.updatePlayer(
            room as string,
            gameRoom.roomInfo.players,
            'players',
          );
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
      this.updatePlayer(
        room as string,
        `User(${user.nickName}) joined.`,
        'join',
      );
    } catch (e) {
      throw e;
    }
  }

  // 离开房间
  connectLeave() {}

  @SubscribeMessage('exchange')
  exchange(@MessageBody() message: any, @ConnectedSocket() socket: Socket) {
    try {
      const { target, payload } = message;
      const client = socket.id;

      if (!target) return;

      const msg = parseMsg('exchange', payload, { client, target });
      this.io.emit(target, msg);
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
  async buyIn(@MessageBody() body: any, @ConnectedSocket() socket: Socket) {
    try {
      const query = socket.handshake.query;
      const { token, room } = query;
      const id = socket.id;
      const user = await this.getUserInfo(token as string);
      const userInfo: IPlayer = {
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
      const roomInfo: IRoomInfo = await this.getRoomInfo(room as string);
      const { payload } = body;
      const { buyInSize } = payload;
      // find current player
      const player = roomInfo.players.find(
        (p: IPlayer) => p.userId === userInfo.userId,
      );
      console.log(userInfo, 'userInfo------', player);
      const isGaming = !!roomInfo.game;
      if (player) {
        if (roomInfo.game) {
          const inTheGame = roomInfo.game.allPlayer.find(
            (p) => p.userId === userInfo.userId,
          );
          // player in the game, can't buy in
          if (inTheGame) {
            player.reBuy += Number(buyInSize);
            player.buyIn += Number(buyInSize);
            console.log('come in');
          } else {
            player.buyIn += Number(buyInSize);
            player.counter += Number(buyInSize);
          }
          console.log('user in the game------', player);
        } else {
          console.log('user not in the game------', player);
          player.buyIn += Number(buyInSize);
          player.counter += Number(buyInSize);
        }
      } else {
        const player: IPlayer = {
          counter: Number(buyInSize),
          buyIn: Number(buyInSize),
          ...userInfo,
        };
        roomInfo.players.push(player);
      }
      console.log(player, 'buy in player', roomInfo.players);
      if (!isGaming) {
        this.updatePlayer(room as string, roomInfo.players, 'players');
        console.log('not in the game', player);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getSitDownPlayer(roomInfo: IRoomInfo): Promise<IPlayer[]> {
    let sitDownPlayer: IPlayer[] = [];
    // first game sitLink is null
    if (roomInfo.sitLink) {
      let currNode: ILinkNode<IPlayer> | null = roomInfo.sitLink;
      const currPlayer = currNode.node;
      sitDownPlayer.push(currNode.node);
      while (currNode && currPlayer.userId !== currNode.next?.node.userId) {
        const next: ILinkNode<IPlayer> | null = currNode.next;
        if (next) {
          sitDownPlayer.push(next.node);
        }
        currNode = next;
      }
    } else {
      sitDownPlayer = roomInfo.sit
        .filter((s) => s.player && s.player.counter > 0)
        .map((sit) => sit.player);
      if (sitDownPlayer.length < 2) {
        throw 'player not enough';
      }
      roomInfo.sitLink = new Link<IPlayer>(sitDownPlayer).link;
    }
    if (sitDownPlayer.length < 2) {
      throw 'player not enough';
    }
    return sitDownPlayer;
  }

  async reStart(room: string, body: any, socket: Socket) {
    try {
      const roomInfo: IRoomInfo = await this.getRoomInfo(room);
      const dealer = roomInfo.game?.allPlayer.filter((gamePlayer) => {
        return !!roomInfo.sit.find(
          (s) =>
            s.player?.userId === gamePlayer.userId &&
            s.player.counter > 0 &&
            s.player?.userId !== roomInfo.sitLink?.node.userId,
        );
      })[0];
      console.log('dealer -------', dealer);
      roomInfo.game = null;
      // init player status
      roomInfo.players.forEach((p) => {
        p.status = 0;
      });
      console.log('sit =======', roomInfo.sit);
      console.log('roomInfo =======', roomInfo);
      roomInfo.sit.forEach((s: ISit) => {
        if (s.player) {
          const player = roomInfo.players.find(
            (p) => p.userId === s.player?.userId,
          );
          if (player) {
            // calculate re buy in
            s.player.counter = player.counter;
            s.player.counter += Number(player.reBuy);
            console.log(
              'cal reBuy ===============================',
              s.player,
              player.reBuy,
            );
            player.reBuy = 0;
            s.player.reBuy = 0;
            // init player delay count
            player.delayCount = 3;
          }
        }
      });
      // clear counter not enough player
      roomInfo.sit.forEach((s: ISit) => {
        if (s.player && s.player.counter === 0) {
          delete s.player;
        }
      });
      const players =
        roomInfo.sit
          .filter((s) => s.player && s.player.counter > 0)
          .map((s) => s.player) || [];
      let link: ILinkNode<IPlayer> | null = new Link<IPlayer>(players).link;
      if (players.length >= 2) {
        // init sit link
        console.log(players, 'players===========');
        while (link?.node.userId !== dealer?.userId) {
          link = link?.next || null;
        }
        roomInfo.sitLink = link;
        console.log('dealer ===================', dealer, link);
        // new game
        await this.adapter(room, 'online', 'newGame', {});
        await this.playGame(body, socket);
      } else {
        roomInfo.sitLink = null;
        console.log('come in only one player');
        // player not enough
        await this.adapter(room, 'online', 'pause', {
          players: roomInfo.players,
          sitList: roomInfo.sit,
        });
      }
    } catch (e) {
      console.log(e + 'restart ex');
    }
  }

  private async sendHandCard(roomInfo: IRoomInfo, room: string) {
    for (const p of roomInfo.players) {
      const player = roomInfo.game?.allPlayer.find(
        (player) => player.userId === p.userId,
      );
      const msg = parseMsg(
        'handCard',
        {
          handCard: player?.getHandCard(),
        },
        { client: p.socketId },
      );
      this.io.emit(p.socketId, msg);
      if (player) {
        const playerRecord: IPlayerDTO = {
          roomNumber: Number(room),
          gameId: roomInfo.gameId || 0,
          userId: player.userId || '',
          buyIn: p.buyIn,
          counter: p.counter,
          handCard: player.getHandCard().join(',') || '',
        };
        const playerId = await this.playerService.add(playerRecord);
        player.playerId = playerId.id;
      }
    }
  }

  @SubscribeMessage('playGame')
  async playGame(@MessageBody() body: any, @ConnectedSocket() socket: Socket) {
    try {
      const query = socket.handshake.query;
      const { room } = query;
      const roomInfo = await this.getRoomInfo(room as string);
      const sitDownPlayer = await this.getSitDownPlayer(roomInfo);
      console.log('roomConfig-------------------', roomInfo.config);
      if (!roomInfo.game) {
        roomInfo.game = null;
        roomInfo.game = new PokerGame({
          users: sitDownPlayer,
          isShort: roomInfo.config.isShort,
          smallBlind: roomInfo.config.smallBlind,
          actionRoundComplete: async () => {
            let slidePots: number[] = [];
            if (roomInfo.game) {
              console.log('come in', roomInfo.game.status);
              if (roomInfo.game.status < 6 && roomInfo.game.playerSize > 1) {
                // roomInfo.game.sendCard();
                // roomInfo.game.startActionRound();
                // has allin，deal slide pot
                if (roomInfo.game.allInPlayers.length > 0) {
                  slidePots = roomInfo.game.slidePots;
                }
                await this.adapter(room as string, 'online', 'actionComplete', {
                  slidePots,
                  actionEndTime: roomInfo.game.actionEndTime,
                  commonCard: roomInfo.game.commonCard,
                });
              }
            }
          },
          gameOverCallBack: async () => {
            if (roomInfo.game) {
              // game over
              roomInfo.game.allPlayer.forEach((gamePlayer) => {
                console.log('player =================== game over', gamePlayer);
                const player = roomInfo.players.find(
                  (p: IPlayer) => p.userId === gamePlayer.userId,
                );
                const sit = roomInfo.sit.find(
                  (s: ISit) => s.player?.userId === gamePlayer.userId,
                );
                if (player && sit) {
                  player.counter = gamePlayer.counter;
                  player.actionCommand = '';
                  player.actionSize = 0;
                  player.type = '';
                  sit.player.counter = gamePlayer.counter;
                  sit.player.actionCommand = '';
                  sit.player.actionSize = 0;
                  sit.player.type = '';
                }
              });
              console.log(
                'allPlayer =================== game over',
                roomInfo.game.allPlayer,
              );
              if (roomInfo.game.status === EGameStatus.GAME_OVER) {
                let winner: any = [
                  [
                    {
                      ...roomInfo.game.winner[0][0],
                      handCard: [],
                    },
                  ],
                ];
                let allPlayers = winner[0];
                // only player, other fold
                if (roomInfo.game.getPlayers().length !== 1) {
                  winner = roomInfo.game.winner;
                  allPlayers = roomInfo.game.getPlayers();
                }
                await this.adapter(room as string, 'online', 'gameOver', {
                  winner,
                  allPlayers,
                  commonCard: roomInfo.game.commonCard,
                });
                // new game
                setTimeout(() => {
                  this.reStart(room as string, body, socket);
                }, 5000);
              }
            }
            // update game info
            const gameRecord: IGame = {
              id: roomInfo.gameId,
              pot: roomInfo.game?.pot || 0,
              commonCard: roomInfo.game?.commonCard.join(',') || '',
              winners: JSON.stringify(roomInfo.game?.winner).replace(' ', ''),
              status: roomInfo.game?.gameOverType || 0,
            };
            const result = await this.gameService.update(gameRecord);
            if (!result.succeed) {
              throw 'update game error';
            }

            // update player counter
            if (roomInfo.game) {
              for await (const p of roomInfo.game.allPlayer) {
                const uPlayer = {
                  playerId: p.playerId,
                  counter: p.counter,
                  userId: p.userId,
                  gameId: roomInfo.gameId || 0,
                };
                this.playerService.update(uPlayer);
              }
            }
          },
          autoActionCallBack: async (command, userId) => {
            // fold change status: -1
            if (command === 'fold') {
              roomInfo.players.forEach((p) => {
                if (p.userId === userId) {
                  p.status = -1;
                }
              });
              console.log('roomInfo', roomInfo.players);
              roomInfo.sit.forEach((s: ISit) => {
                if (s.player && s.player.userId === userId) {
                  delete s.player;
                }
              });
            }
            await this.updateGameInfo(socket);
            console.log('auto Action');
          },
        });
        roomInfo.game.play();
        // roomInfo.game.startActionRound();
        console.log('hand card', roomInfo.game.allPlayer);
        // update counter, pot, status
        await this.updateGameInfo(socket);
        // add game record
        const gameRecord: IGame = {
          roomNumber: room as string,
          pot: 0,
          commonCard: '',
          status: 0,
        };
        const result = await this.gameService.add(gameRecord);
        if (result.succeed) {
          roomInfo.gameId = result.id;
        } else {
          throw 'game add error';
        }
        await this.sendHandCard(roomInfo, room as string);
        // add game BB SB action record
        const BB = roomInfo.game.BBPlayer;
        const SB = roomInfo.game.SBPlayer;
        const BBCommandRecord: ICommandRecord = {
          roomNumber: room as string,
          userId: BB.userId,
          type: BB.type,
          gameStatus: 0,
          pot: roomInfo.config.smallBlind * 3,
          commonCard: '',
          command: `bb:${roomInfo.config.smallBlind * 2}`,
          gameId: result.id,
          counter: BB.counter,
        };
        const SBCommandRecord: ICommandRecord = {
          roomNumber: room as string,
          userId: SB.userId,
          type: SB.type,
          gameStatus: 0,
          pot: roomInfo.config.smallBlind,
          commonCard: '',
          command: `sb:${roomInfo.config.smallBlind}`,
          gameId: result.id,
          counter: SB.counter,
        };
        const sbRecordResult =
          await this.commandRecordService.add(SBCommandRecord);
        const bbRecordResult =
          await this.commandRecordService.add(BBCommandRecord);
        console.log(bbRecordResult, sbRecordResult);
        if (!sbRecordResult.succeed || !bbRecordResult.succeed) {
          throw 'command add error';
        }
      } else {
        throw 'game already paling';
      }
    } catch (error) {
      console.log('playGame error', error);
      // Todo logger
    }
  }

  @SubscribeMessage('action')
  async action(@MessageBody() body: any, @ConnectedSocket() socket: Socket) {
    try {
      const query = socket.handshake.query;
      const { room, token } = query;
      const { payload } = body;
      const userInfo = await this.getUserInfo(token as string);
      const roomInfo = await this.getRoomInfo(room as string);
      console.log('action: ', payload.command);
      console.log(
        'action: ',
        roomInfo.game && roomInfo.game.currPlayer.node,
        userInfo,
      );
      if (
        roomInfo.game &&
        roomInfo.game.currPlayer.node.userId === userInfo.userId
      ) {
        const currPlayer = roomInfo.game.currPlayer.node;
        const commonCard = roomInfo.game.commonCard;
        let status = 0;
        if (commonCard.length === 3) {
          status = EGameStatus.GAME_FLOP;
        }
        if (commonCard.length === 4) {
          status = EGameStatus.GAME_TURN;
        }
        if (commonCard.length === 5) {
          status = EGameStatus.GAME_RIVER;
        }
        if (commonCard.length === 6) {
          status = EGameStatus.GAME_SHOWDOWN;
        }
        const commandRecord: ICommandRecord = {
          roomNumber: room as string,
          userId: userInfo.userId,
          type: currPlayer.type,
          gameStatus: status,
          pot: 0,
          commonCard: roomInfo.game?.commonCard.join(',') || '',
          command: payload.command,
          gameId: roomInfo.gameId || 0,
          counter: currPlayer.counter,
        };
        roomInfo.game.action(payload.command);
        const commandArr = payload.command.split(':');
        const command = commandArr[0];
        // fold change status: -1
        if (command === 'fold') {
          roomInfo.players.forEach((p) => {
            if (p.userId === userInfo.userId) {
              p.status = -1;
            }
          });
        }
        console.log(
          'fold ===============',
          roomInfo.players,
          roomInfo.game.allPlayer,
        );
        // todo notice next player action
        await this.updateGameInfo(socket);
        console.log('curr player', roomInfo.game.currPlayer.node);
        // add game record
        commandRecord.pot = roomInfo.game?.pot || 0;
        commandRecord.counter = currPlayer.counter;
        await this.commandRecordService.add(commandRecord);
      } else {
        throw 'action flow incorrect';
      }
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('sitDown')
  async sitDown(@MessageBody() body: any, @ConnectedSocket() socket: Socket) {
    try {
      const query = socket.handshake.query;
      const { room } = query;
      const { payload } = body;
      const sitList = payload.sitList;
      const roomInfo = await this.getRoomInfo(room as string);
      console.log('sitList=============', sitList);
      roomInfo.sit = sitList;
      await this.adapter(room as string, 'online', 'sitList', {
        sitList,
      });
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('standUp')
  async standUp(@MessageBody() body: any, @ConnectedSocket() socket: Socket) {
    try {
      console.log('come in');
      const query = socket.handshake.query;
      const { room, token } = query;
      const userInfo = await this.getUserInfo(token as string);
      const roomInfo = await this.getRoomInfo(room as string);
      roomInfo.sit.forEach((s: ISit) => {
        if (s.player && s.player.userId === userInfo.userId) {
          delete s.player;
        }
      });
      await this.updateGameInfo(socket);
      await this.adapter(room as string, 'online', 'sitList', {
        sitList: roomInfo.sit,
      });
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('delayTime')
  async delayTime(@MessageBody() body: any, @ConnectedSocket() socket: Socket) {
    try {
      const query = socket.handshake.query;
      const { room, token } = query;
      const { payload } = body;
      const userInfo = await this.getUserInfo(token as string);
      const roomInfo = await this.getRoomInfo(room as string);
      console.log('delayTime: ', payload.command);
      console.log(
        'delayTime: ',
        roomInfo.game && roomInfo.game.currPlayer.node,
        userInfo,
      );
      if (
        roomInfo.game &&
        roomInfo.game.currPlayer.node.userId === userInfo.userId
      ) {
        roomInfo.game.delayActionTime();
        console.log(
          'delayTime: ',
          roomInfo.game && roomInfo.game.currPlayer.node,
          userInfo,
        );
        await this.adapter(room as string, 'online', 'delayTime', {
          actionEndTime: roomInfo.game.actionEndTime,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
}
