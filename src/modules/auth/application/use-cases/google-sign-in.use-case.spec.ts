import { ConflictError, UnauthorizedError } from '@/core/errors';
import { type UserEntity } from '../../domain/entities/user.entity';
import { type UserRepository } from '../../domain/repositories/user.repository';
import { type GoogleOAuthService } from '../ports/google-oauth';
import type { AuthTokenIssuer } from '../services/auth-token-issuer';
import { GoogleSignInUseCase } from './google-sign-in.use-case';

const googleProfile = {
  googleId: 'google-sub-123',
  email: 'google@test.com',
  firstName: 'Google',
  lastName: 'User',
  avatarUrl: 'https://example.com/avatar.png',
  emailVerified: true,
};

const googleUser: UserEntity = {
  id: '33333333-3333-3333-3333-333333333333',
  email: 'google@test.com',
  passwordHash: null,
  googleId: 'google-sub-123',
  role: 'CUSTOMER',
  status: 'ACTIVE',
  firstName: 'Google',
  lastName: 'User',
  phone: null,
  emailVerifiedAt: new Date('2026-01-01T00:00:00.000Z'),
  themePreference: 'SYSTEM',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

const authResult = {
  user: {
    id: googleUser.id,
    email: googleUser.email,
    role: googleUser.role,
    status: googleUser.status,
    firstName: googleUser.firstName,
    lastName: googleUser.lastName,
    themePreference: 'SYSTEM' as const,
  },
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('GoogleSignInUseCase', () => {
  const users: jest.Mocked<UserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn(),
    create: jest.fn(),
    createGoogleUser: jest.fn(),
    linkGoogleAccount: jest.fn(),
    updatePreferences: jest.fn(),
  };

  const googleOAuth: jest.Mocked<GoogleOAuthService> = {
    verifyIdToken: jest.fn(),
  };

  const tokenIssuer = {
    issue: jest.fn(),
  } as unknown as jest.Mocked<AuthTokenIssuer>;

  const useCase = new GoogleSignInUseCase(users, googleOAuth, tokenIssuer);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs in an existing Google user', async () => {
    googleOAuth.verifyIdToken.mockResolvedValue(googleProfile);
    users.findByGoogleId.mockResolvedValue(googleUser);
    tokenIssuer.issue.mockResolvedValue(authResult);

    const result = await useCase.execute({ idToken: 'valid-id-token' });

    expect(result).toEqual(authResult);
    expect(users.createGoogleUser).not.toHaveBeenCalled();
  });

  it('creates a new user when Google account is new', async () => {
    googleOAuth.verifyIdToken.mockResolvedValue(googleProfile);
    users.findByGoogleId.mockResolvedValue(null);
    users.findByEmail.mockResolvedValue(null);
    users.createGoogleUser.mockResolvedValue(googleUser);
    tokenIssuer.issue.mockResolvedValue(authResult);

    const result = await useCase.execute({ idToken: 'valid-id-token' });

    expect(result).toEqual(authResult);
    expect(users.createGoogleUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: googleProfile.email,
        googleId: googleProfile.googleId,
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        avatarUrl: googleProfile.avatarUrl,
      }),
    );
    const createPayload = users.createGoogleUser.mock.calls[0]?.[0];
    expect(createPayload?.emailVerifiedAt).toBeInstanceOf(Date);
  });

  it('links Google account to an existing email user', async () => {
    const emailUser = { ...googleUser, googleId: null, passwordHash: 'hash' };

    googleOAuth.verifyIdToken.mockResolvedValue(googleProfile);
    users.findByGoogleId.mockResolvedValue(null);
    users.findByEmail.mockResolvedValue(emailUser);
    users.linkGoogleAccount.mockResolvedValue(googleUser);
    tokenIssuer.issue.mockResolvedValue(authResult);

    const result = await useCase.execute({ idToken: 'valid-id-token' });

    expect(result).toEqual(authResult);
    expect(users.linkGoogleAccount).toHaveBeenCalled();
  });

  it('throws when email is linked to another Google account', async () => {
    googleOAuth.verifyIdToken.mockResolvedValue(googleProfile);
    users.findByGoogleId.mockResolvedValue(null);
    users.findByEmail.mockResolvedValue({
      ...googleUser,
      googleId: 'different-google-id',
    });

    await expect(useCase.execute({ idToken: 'valid-id-token' })).rejects.toThrow(
      new ConflictError('This email is linked to another Google account'),
    );
  });

  it('throws when account is not active', async () => {
    googleOAuth.verifyIdToken.mockResolvedValue(googleProfile);
    users.findByGoogleId.mockResolvedValue({ ...googleUser, status: 'SUSPENDED' });

    await expect(useCase.execute({ idToken: 'valid-id-token' })).rejects.toThrow(
      new UnauthorizedError('Account is not active'),
    );
  });
});
