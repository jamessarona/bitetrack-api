import { UnauthorizedError } from '@/core/errors';
import { type UserEntity } from '../../domain/entities/user.entity';
import { type UserRepository } from '../../domain/repositories/user.repository';
import { type PasswordHasher } from '../ports/password-hasher';
import type { AuthTokenIssuer } from '../services/auth-token-issuer';
import { LoginUseCase } from './login.use-case';

const activeUser: UserEntity = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'user@test.com',
  passwordHash: 'hashed-password',
  googleId: null,
  role: 'CUSTOMER',
  status: 'ACTIVE',
  firstName: 'Test',
  lastName: 'User',
  phone: null,
  emailVerifiedAt: null,
  themePreference: 'SYSTEM',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

const authResult = {
  user: {
    id: activeUser.id,
    email: activeUser.email,
    role: activeUser.role,
    status: activeUser.status,
    firstName: activeUser.firstName,
    lastName: activeUser.lastName,
    themePreference: 'SYSTEM' as const,
  },
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('LoginUseCase', () => {
  const users: jest.Mocked<UserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn(),
    create: jest.fn(),
    createGoogleUser: jest.fn(),
    linkGoogleAccount: jest.fn(),
    updatePreferences: jest.fn(),
    updateProfile: jest.fn(),
  };

  const passwordHasher: jest.Mocked<PasswordHasher> = {
    hash: jest.fn(),
    verify: jest.fn(),
  };

  const tokenIssuer = {
    issue: jest.fn(),
  } as unknown as jest.Mocked<AuthTokenIssuer>;

  const useCase = new LoginUseCase(users, passwordHasher, tokenIssuer);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns tokens when credentials are valid', async () => {
    users.findByEmail.mockResolvedValue(activeUser);
    passwordHasher.verify.mockResolvedValue(true);
    tokenIssuer.issue.mockResolvedValue(authResult);

    const result = await useCase.execute({
      email: 'user@test.com',
      password: 'password123',
      userAgent: 'jest',
      ipAddress: '127.0.0.1',
    });

    expect(result).toEqual(authResult);
    expect(tokenIssuer.issue).toHaveBeenCalledWith(activeUser, {
      userAgent: 'jest',
      ipAddress: '127.0.0.1',
    });
  });

  it('throws when user is not found', async () => {
    users.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'missing@test.com', password: 'password123' }),
    ).rejects.toThrow(new UnauthorizedError('Invalid email or password'));
  });

  it('throws when password is invalid', async () => {
    users.findByEmail.mockResolvedValue(activeUser);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'user@test.com', password: 'wrong' }),
    ).rejects.toThrow(new UnauthorizedError('Invalid email or password'));
  });

  it('throws when account is not active', async () => {
    users.findByEmail.mockResolvedValue({ ...activeUser, status: 'SUSPENDED' });
    passwordHasher.verify.mockResolvedValue(true);

    await expect(
      useCase.execute({ email: 'user@test.com', password: 'password123' }),
    ).rejects.toThrow(new UnauthorizedError('Account is not active'));
  });
});
