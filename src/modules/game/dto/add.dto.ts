import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AddDTO {
  @IsNotEmpty({ message: 'roomNumber不能为空' })
  @IsString({ message: 'roomNumber必须是字符串' })
  @ApiProperty({ description: '房间号' })
  readonly roomNumber: string;

  @IsNumber({ allowNaN: true })
  @ApiProperty({ description: '底池' })
  readonly pot: number;

  @IsNotEmpty({ message: 'commonCard不能为空' })
  @IsString({ message: 'commonCard必须是字符串' })
  @ApiProperty({ description: '公共牌' })
  readonly commonCard: string;

  @IsNumber({ allowNaN: true })
  @ApiProperty({ description: '状态' })
  readonly status: number;
}
