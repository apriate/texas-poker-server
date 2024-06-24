import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: '账号必填' })
  @IsString()
  @ApiProperty({ description: '账号' })
  readonly account: string;

  @IsNotEmpty({ message: '密码必填' })
  @IsString()
  @ApiProperty({ description: '密码' })
  readonly password: string;
}
