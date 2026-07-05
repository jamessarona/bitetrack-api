import { inject, injectable } from 'tsyringe';
import { DI } from '@/infrastructure/di/tokens';
import { toPublicUser, type UserEntity } from '../../domain/entities/user.entity';
import { type RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { type BusinessRepository } from '@/modules/business/domain/repositories/business.repository';
import { type AuthResult } from '../dtos/auth.dto';
import { type TokenService } from '../ports/token-service';

interface IssueContext {
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

@injectable()
export class AuthTokenIssuer {
  constructor(
    @inject(DI.TokenService) private readonly tokenService: TokenService,
    @inject(DI.RefreshTokenRepository)
    private readonly refreshTokens: RefreshTokenRepository,
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
  ) {}

  async issue(user: UserEntity, context: IssueContext = {}): Promise<AuthResult> {
    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refresh = this.tokenService.generateRefreshToken();
    await this.refreshTokens.create({
      userId: user.id,
      tokenHash: refresh.tokenHash,
      expiresAt: refresh.expiresAt,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    });

    const businessCount = await this.businesses.countByOwner(user.id);

    return {
      user: toPublicUser(user, businessCount),
      accessToken,
      refreshToken: refresh.token,
    };
  }
}
