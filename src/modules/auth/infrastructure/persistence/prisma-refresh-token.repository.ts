import { inject, injectable } from 'tsyringe';
import { type PrismaClient } from '@prisma/client';
import { DI } from '@/infrastructure/di/tokens';
import {
  type CreateRefreshTokenInput,
  type RefreshTokenRepository,
  type StoredRefreshToken,
} from '../../domain/repositories/refresh-token.repository';

@injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(@inject(DI.PrismaClient) private readonly prisma: PrismaClient) {}

  async create(input: CreateRefreshTokenInput): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
      },
    });
  }

  async findByHash(tokenHash: string): Promise<StoredRefreshToken | null> {
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
    };
  }

  async revokeById(id: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
