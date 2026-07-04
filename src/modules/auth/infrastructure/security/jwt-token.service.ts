import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import { config } from '@/config';
import { UnauthorizedError } from '@/core/errors';
import {
  type AccessTokenPayload,
  type GeneratedRefreshToken,
  type TokenService,
} from '@/modules/auth/application/ports/token-service';

const REFRESH_TOKEN_BYTES = 48;

@injectable()
export class JwtTokenService implements TokenService {
  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    } as jwt.SignOptions);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      });

      if (typeof decoded === 'string' || !decoded.sub || !decoded.email || !decoded.role) {
        throw new UnauthorizedError('Invalid access token');
      }

      return {
        sub: decoded.sub,
        email: String(decoded.email),
        role: decoded.role as AccessTokenPayload['role'],
      };
    } catch {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  generateRefreshToken(): GeneratedRefreshToken {
    const token = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const expiresAt = new Date(
      Date.now() + parseDurationMs(config.jwt.refreshExpiresIn),
    );

    return {
      token,
      tokenHash: this.hashRefreshToken(token),
      expiresAt,
    };
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

/** Parses a simple duration string like `15m`, `30d`, `1h` into milliseconds. */
function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    // Fallback: treat as seconds if no unit is provided.
    const seconds = Number(value);
    return Number.isFinite(seconds) ? seconds * 1000 : 30 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * (multipliers[unit] ?? 1000);
}
