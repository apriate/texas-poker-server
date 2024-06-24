import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '昵称' })
  readonly nickName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '账号' })
  readonly account: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '密码' })
  readonly password: string;
}
