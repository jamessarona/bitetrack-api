import { BadRequestError, NotFoundError } from '@/core/errors';
import { type UserEntity } from '../../domain/entities/user.entity';
import { type UserRepository } from '../../domain/repositories/user.repository';
import { type BusinessRepository } from '@/modules/business/domain/repositories/business.repository';
import { UpdateUserProfileUseCase } from './update-user-profile.use-case';

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

describe('UpdateUserProfileUseCase', () => {
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

  const businesses: jest.Mocked<Pick<BusinessRepository, 'countByOwner'>> = {
    countByOwner: jest.fn(),
  };

  const useCase = new UpdateUserProfileUseCase(users, businesses as unknown as BusinessRepository);

  beforeEach(() => {
    jest.clearAllMocks();
    businesses.countByOwner.mockResolvedValue(0);
  });

  it('updates profile fields and returns public user', async () => {
    users.findById.mockResolvedValue(activeUser);
    users.updateProfile.mockResolvedValue({
      ...activeUser,
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+639171234567',
    });

    const result = await useCase.execute(activeUser.id, {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+639171234567',
    });

    expect(result.firstName).toBe('Updated');
    expect(result.lastName).toBe('Name');
    expect(result.phone).toBe('+639171234567');
  });

  it('clears phone when empty string is sent', async () => {
    users.findById.mockResolvedValue(activeUser);
    users.updateProfile.mockResolvedValue({ ...activeUser, phone: null });

    await useCase.execute(activeUser.id, { phone: '' });

    expect(users.updateProfile).toHaveBeenCalledWith(activeUser.id, {
      phone: null,
    });
  });

  it('rejects empty last name updates', async () => {
    users.findById.mockResolvedValue(activeUser);

    await expect(
      useCase.execute(activeUser.id, { lastName: '   ' }),
    ).rejects.toThrow(new BadRequestError('Last name is required'));
  });

  it('throws when user is not found', async () => {
    users.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing-id', { firstName: 'Updated' }),
    ).rejects.toThrow(new NotFoundError('User not found'));
  });
});
