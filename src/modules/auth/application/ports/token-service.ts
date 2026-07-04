import { type UserRole } from '../../domain/entities/user.entity';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface GeneratedRefreshToken {
  token: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface TokenService {
  signAccessToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload;
  generateRefreshToken(): GeneratedRefreshToken;
  hashRefreshToken(token: string): string;
}
