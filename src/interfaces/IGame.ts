export interface IGame {
  id?: number;
  roomNumber?: string;
  pot: number;
  status: number;
  commonCard: string;
  winners?: string;
}
