/**
 * Dependency-injection tokens for interfaces/ports that cannot be referenced
 * by their TypeScript type at runtime.
 */
export const DI = {
  // Infrastructure primitives
  PrismaClient: Symbol('PrismaClient'),
  Redis: Symbol('Redis'),

  // Auth ports
  UserRepository: Symbol('UserRepository'),
  RefreshTokenRepository: Symbol('RefreshTokenRepository'),
  PasswordHasher: Symbol('PasswordHasher'),
  TokenService: Symbol('TokenService'),
} as const;
