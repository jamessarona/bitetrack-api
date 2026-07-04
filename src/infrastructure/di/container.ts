import { container } from 'tsyringe';
import { type PrismaClient } from '@prisma/client';
import { type Redis } from 'ioredis';
import { prisma } from '@/infrastructure/database/prisma';
import { redis } from '@/infrastructure/cache/redis';
import { DI } from './tokens';
import { Argon2PasswordHasher } from '@/modules/auth/infrastructure/security/argon2-password-hasher';
import { JwtTokenService } from '@/modules/auth/infrastructure/security/jwt-token.service';
import { PrismaUserRepository } from '@/modules/auth/infrastructure/persistence/prisma-user.repository';
import { PrismaRefreshTokenRepository } from '@/modules/auth/infrastructure/persistence/prisma-refresh-token.repository';

let initialized = false;

/**
 * Registers infrastructure singletons and module bindings into the tsyringe
 * container. Safe to call multiple times (idempotent).
 */
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

  initialized = true;
}

export { container };
