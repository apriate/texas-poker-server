import { IsBoolean, IsInt, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRoomDTO {
  @IsNotEmpty({ message: 'isShort不能为空' })
  @IsBoolean()
  @Transform(({ value }) => {
    return [true, 'enabled', 'true', 1, '1'].indexOf(value) > -1;
  })
  readonly isShort: boolean;

  @IsNotEmpty({ message: 'smallBlind不能为空' })
  @IsInt({ message: 'smallBlind必须是数字' })
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number(value);
    }
    return value;
  })
  readonly smallBlind: number;

  @IsNotEmpty({ message: 'time不能为空' })
  @IsInt({ message: 'time必须是数字' })
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number(value);
    }
    return value;
  })
  readonly time: number;
}
