import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { LoginDto, RegisterDto, TokenResponseDto, AuthUserResponseDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthUserResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Assign default role
    let defaultRole = await this.roleRepository.findOne({
      where: { name: 'requester' },
    });

    if (!defaultRole) {
      defaultRole = this.roleRepository.create({
        name: 'requester',
        displayName: 'Requester',
        description: 'Default role for new users',
        isSystemRole: true,
      });
      defaultRole = await this.roleRepository.save(defaultRole);
    }

    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      title: registerDto.title,
      department: registerDto.department,
      status: UserStatus.ACTIVE,
      roles: [defaultRole],
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User registered: ${savedUser.email}`);

    const tokens = await this.generateTokens(savedUser);
    await this.updateRefreshToken(savedUser.id, tokens.refreshToken);

    return {
      id: savedUser.id,
      email: savedUser.email,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      roles: savedUser.roleNames,
      tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthUserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roleNames,
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles'],
      });

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      this.logger.warn(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshTokenHash: null });
    this.logger.log(`User logged out: ${userId}`);
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async generateTokens(user: User): Promise<TokenResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roleNames,
      tenantId: user.tenantId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
      tokenType: 'Bearer',
    };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, { refreshTokenHash: hash });
  }
}
