import { type UserEntity, type UserRole } from '../entities/user.entity';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName?: string | undefined;
  lastName?: string | undefined;
}

export interface CreateGoogleUserInput {
  email: string;
  googleId: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  emailVerifiedAt?: Date | null;
}

export interface LinkGoogleAccountInput {
  googleId: string;
  avatarUrl?: string | null;
  emailVerifiedAt?: Date | null;
}

export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByGoogleId(googleId: string): Promise<UserEntity | null>;
  create(input: CreateUserInput): Promise<UserEntity>;
  createGoogleUser(input: CreateGoogleUserInput): Promise<UserEntity>;
  linkGoogleAccount(userId: string, input: LinkGoogleAccountInput): Promise<UserEntity>;
}
