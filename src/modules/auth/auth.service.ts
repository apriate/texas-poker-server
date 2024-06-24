import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/User';
import jwtConfig from '../../config/jwt.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register';
import { HashingService } from './hashing.service';
import { ActiveUser } from '../../interfaces/IActiveUser';
import { ResultData } from 'src/common/result';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async generateTokens(user: User) {
    const token = await this.getToken<Partial<ActiveUser>>(user.id, {
      account: user.account,
      nickName: user.nickName,
    });
    return { token };
  }

  private async getToken<T>(id: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        id,
        ...payload,
      },
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: this.jwtConfiguration.accessTokenTtl,
      },
    );
  }

  async register(registerDto: RegisterDto) {
    const { account, password } = registerDto;
    const existingUser = await this.userRepository.findOne({
      where: [{ account }],
    });
    if (existingUser) {
      return ResultData.fail('User already exists');
    }

    const hashedPassword = await this.hashingService.hash(password);
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const result = await this.userRepository.save(user);
    return ResultData.success(result);
  }

  async login(loginDto: LoginDto) {
    const { account, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { account } });
    if (!user) return ResultData.fail('User not found');

    const isEqual = await this.hashingService.compare(password, user.password);
    if (!isEqual) return ResultData.fail('Password is incorrect');

    const result = await this.generateTokens(user);
    return ResultData.success(result);
  }
}
