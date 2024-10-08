export interface IPlayerDTO {
  roomNumber: number;
  userId: string;
  counter: number;
  gameId: number;
  handCard: string;
  buyIn: number;
}

export interface UpdatePlayerDTO {
  userId: string;
  counter: number;
  gameId: number;
  playerId: number;
}
