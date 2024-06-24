import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'account不能为空' })
  @IsString({ message: 'account必须是字符串' })
  @ApiProperty({ description: '账号' })
  readonly account: string;

  @IsNotEmpty({ message: 'password不能为空' })
  @IsString({ message: 'password必须是字符串' })
  @ApiProperty({ description: '密码' })
  readonly password: string;
}
