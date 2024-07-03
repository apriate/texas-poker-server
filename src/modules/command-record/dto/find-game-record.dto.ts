import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindGameRecordDTO {
  @IsNotEmpty({ message: 'roomNumber不能为空' })
  @IsString({ message: 'roomNumber必须是字符串' })
  @ApiProperty({ description: '房间号' })
  readonly roomNumber: string;
}
