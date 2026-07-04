import { OAuth2Client } from 'google-auth-library';
import { container } from 'tsyringe';
import { type PrismaClient } from '@prisma/client';
import { type Redis } from 'ioredis';
import { config } from '@/config';
import { prisma } from '@/infrastructure/database/prisma';
import { redis } from '@/infrastructure/cache/redis';
import { DI } from './tokens';
import { Argon2PasswordHasher } from '@/modules/auth/infrastructure/security/argon2-password-hasher';
import { JwtTokenService } from '@/modules/auth/infrastructure/security/jwt-token.service';
import { PrismaUserRepository } from '@/modules/auth/infrastructure/persistence/prisma-user.repository';
import { PrismaRefreshTokenRepository } from '@/modules/auth/infrastructure/persistence/prisma-refresh-token.repository';
import { AuthTokenIssuer } from '@/modules/auth/application/services/auth-token-issuer';
import { GoogleOAuthServiceImpl } from '@/modules/auth/infrastructure/security/google-oauth.service';

let initialized = false;

export function setupContainer(): void {
  if (initialized) return;

  container.register<PrismaClient>(DI.PrismaClient, { useValue: prisma });
  container.register<Redis>(DI.Redis, { useValue: redis });

  container.register(DI.PasswordHasher, { useClass: Argon2PasswordHasher });
  container.register(DI.TokenService, { useClass: JwtTokenService });
  container.register(DI.UserRepository, { useClass: PrismaUserRepository });
  container.register(DI.RefreshTokenRepository, {
    useClass: PrismaRefreshTokenRepository,
  });
  container.register(AuthTokenIssuer, { useClass: AuthTokenIssuer });

  if (config.google.clientIds.length > 0) {
    container.register<OAuth2Client>(DI.GoogleOAuthClient, {
      useValue: new OAuth2Client(),
    });
    container.register(DI.GoogleOAuthService, { useClass: GoogleOAuthServiceImpl });
  }

  initialized = true;
}

export { container };
