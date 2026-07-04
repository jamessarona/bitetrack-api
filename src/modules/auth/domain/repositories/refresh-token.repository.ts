export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

export interface StoredRefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

/**
 * Persistence port for refresh tokens (rotation + revocation support).
 */
export interface RefreshTokenRepository {
  create(input: CreateRefreshTokenInput): Promise<void>;
  findByHash(tokenHash: string): Promise<StoredRefreshToken | null>;
  revokeById(id: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
