import { IsNotEmpty } from 'class-validator';

export class FindRoomDTO {
  @IsNotEmpty({ message: 'roomNumber不能为空' })
  readonly roomNumber: string;
}
