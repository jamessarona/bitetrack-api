import { inject, injectable } from 'tsyringe';
import { UnauthorizedError } from '@/core/errors';
import { DI } from '@/infrastructure/di/tokens';
import { type RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { type UserRepository } from '../../domain/repositories/user.repository';
import { type AuthResult, type RefreshInput } from '../dtos/auth.dto';
import { type TokenService } from '../ports/token-service';
import { AuthTokenIssuer } from '../services/auth-token-issuer';

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(DI.UserRepository) private readonly users: UserRepository,
    @inject(DI.RefreshTokenRepository)
    private readonly refreshTokens: RefreshTokenRepository,
    @inject(DI.TokenService) private readonly tokenService: TokenService,
    private readonly tokenIssuer: AuthTokenIssuer,
  ) {}

  async execute(input: RefreshInput): Promise<AuthResult> {
    const tokenHash = this.tokenService.hashRefreshToken(input.refreshToken);
    const stored = await this.refreshTokens.findByHash(tokenHash);

    if (!stored || stored.revokedAt) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      await this.refreshTokens.revokeById(stored.id);
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = await this.users.findById(stored.userId);
    if (user?.status !== 'ACTIVE') {
      await this.refreshTokens.revokeById(stored.id);
      throw new UnauthorizedError('Account is not active');
    }

    await this.refreshTokens.revokeById(stored.id);

    return this.tokenIssuer.issue(user, {
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });
  }
}
