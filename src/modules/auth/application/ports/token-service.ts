import { type UserRole } from '../../domain/entities/user.entity';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface GeneratedRefreshToken {
  /** The raw token returned to the client. */
  token: string;
  /** SHA-256 hash persisted server-side (never store the raw token). */
  tokenHash: string;
  expiresAt: Date;
}

/** Port for issuing/verifying JWT access tokens and opaque refresh tokens. */
export interface TokenService {
  signAccessToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload;
  generateRefreshToken(): GeneratedRefreshToken;
  hashRefreshToken(token: string): string;
}
