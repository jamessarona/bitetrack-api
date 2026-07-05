import { ConflictError } from '@/core/errors';
import { type UserEntity } from '../../domain/entities/user.entity';
import { type UserRepository } from '../../domain/repositories/user.repository';
import { type PasswordHasher } from '../ports/password-hasher';
import type { AuthTokenIssuer } from '../services/auth-token-issuer';
import { RegisterUseCase } from './register.use-case';

const newUser: UserEntity = {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'new@test.com',
  passwordHash: 'hashed-password',
  googleId: null,
  role: 'CUSTOMER',
  status: 'ACTIVE',
  firstName: 'New',
  lastName: 'User',
  phone: null,
  emailVerifiedAt: null,
  themePreference: 'SYSTEM',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

const authResult = {
  user: {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    themePreference: 'SYSTEM' as const,
  },
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('RegisterUseCase', () => {
  const users: jest.Mocked<UserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn(),
    create: jest.fn(),
    createGoogleUser: jest.fn(),
    linkGoogleAccount: jest.fn(),
    updatePreferences: jest.fn(),
  };

  const passwordHasher: jest.Mocked<PasswordHasher> = {
    hash: jest.fn(),
    verify: jest.fn(),
  };

  const tokenIssuer = {
    issue: jest.fn(),
  } as unknown as jest.Mocked<AuthTokenIssuer>;

  const useCase = new RegisterUseCase(users, passwordHasher, tokenIssuer);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user and returns tokens', async () => {
    users.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-password');
    users.create.mockResolvedValue(newUser);
    tokenIssuer.issue.mockResolvedValue(authResult);

    const result = await useCase.execute({
      email: 'new@test.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    });

    expect(result).toEqual(authResult);
    expect(users.create).toHaveBeenCalledWith({
      email: 'new@test.com',
      passwordHash: 'hashed-password',
      role: 'CUSTOMER',
      firstName: 'New',
      lastName: 'User',
    });
  });

  it('throws when email already exists', async () => {
    users.findByEmail.mockResolvedValue(newUser);

    await expect(
      useCase.execute({
        email: 'new@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      }),
    ).rejects.toThrow(new ConflictError('An account with this email already exists'));
  });
});
