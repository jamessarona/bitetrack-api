export const DI = {
  PrismaClient: Symbol('PrismaClient'),
  Redis: Symbol('Redis'),

  UserRepository: Symbol('UserRepository'),
  RefreshTokenRepository: Symbol('RefreshTokenRepository'),
  PasswordHasher: Symbol('PasswordHasher'),
  TokenService: Symbol('TokenService'),
  GoogleOAuthClient: Symbol('GoogleOAuthClient'),
  GoogleOAuthService: Symbol('GoogleOAuthService'),
} as const;
