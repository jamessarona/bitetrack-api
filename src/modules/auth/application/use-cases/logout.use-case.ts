import { inject, injectable } from 'tsyringe';
import { DI } from '@/infrastructure/di/tokens';
import { type RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { type TokenService } from '../ports/token-service';

export interface LogoutInput {
  refreshToken: string;
}

@injectable()
export class LogoutUseCase {
  constructor(
    @inject(DI.RefreshTokenRepository)
    private readonly refreshTokens: RefreshTokenRepository,
    @inject(DI.TokenService) private readonly tokenService: TokenService,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    const tokenHash = this.tokenService.hashRefreshToken(input.refreshToken);
    const stored = await this.refreshTokens.findByHash(tokenHash);
    if (stored && !stored.revokedAt) {
      await this.refreshTokens.revokeById(stored.id);
    }
  }
}
