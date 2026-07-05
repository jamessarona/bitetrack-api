import { type ThemePreference, type UserEntity, type UserRole } from '../entities/user.entity';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface CreateGoogleUserInput {
  email: string;
  googleId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  emailVerifiedAt?: Date | null;
}

export interface LinkGoogleAccountInput {
  googleId: string;
  avatarUrl?: string | null;
  emailVerifiedAt?: Date | null;
}

export interface UpdateUserPreferencesInput {
  themePreference: ThemePreference;
}

export interface UpdateUserProfileInput {
  firstName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | null | undefined;
}

export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByGoogleId(googleId: string): Promise<UserEntity | null>;
  create(input: CreateUserInput): Promise<UserEntity>;
  createGoogleUser(input: CreateGoogleUserInput): Promise<UserEntity>;
  linkGoogleAccount(userId: string, input: LinkGoogleAccountInput): Promise<UserEntity>;
  updatePreferences(userId: string, input: UpdateUserPreferencesInput): Promise<UserEntity>;
  updateProfile(userId: string, input: UpdateUserProfileInput): Promise<UserEntity>;
}
