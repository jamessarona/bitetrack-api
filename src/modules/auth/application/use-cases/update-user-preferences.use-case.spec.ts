import { NotFoundError } from '@/core/errors';
import { type UserEntity } from '../../domain/entities/user.entity';
import { type UserRepository } from '../../domain/repositories/user.repository';
import { UpdateUserPreferencesUseCase } from './update-user-preferences.use-case';

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

describe('UpdateUserPreferencesUseCase', () => {
  const users: jest.Mocked<UserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn(),
    create: jest.fn(),
    createGoogleUser: jest.fn(),
    linkGoogleAccount: jest.fn(),
    updatePreferences: jest.fn(),
  };

  const useCase = new UpdateUserPreferencesUseCase(users);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates theme preference and returns public user', async () => {
    users.findById.mockResolvedValue(activeUser);
    users.updatePreferences.mockResolvedValue({ ...activeUser, themePreference: 'DARK' });

    const result = await useCase.execute(activeUser.id, { themePreference: 'DARK' });

    expect(result.themePreference).toBe('DARK');
    expect(users.updatePreferences).toHaveBeenCalledWith(activeUser.id, {
      themePreference: 'DARK',
    });
  });

  it('throws when user is not found', async () => {
    users.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing-id', { themePreference: 'LIGHT' }),
    ).rejects.toThrow(new NotFoundError('User not found'));
  });
});
