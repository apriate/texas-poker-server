import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindCommandRecordDTO {
  @IsNotEmpty({ message: 'roomNumber不能为空' })
  @IsString({ message: 'roomNumber必须是字符串' })
  @ApiProperty({ description: '房间号' })
  readonly roomNumber: string;

  @IsNotEmpty({ message: 'gameId不能为空' })
  @IsInt({ message: 'gameId必须是数字' })
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number(value);
    }
    return value;
  })
  readonly gameId: number;
}
