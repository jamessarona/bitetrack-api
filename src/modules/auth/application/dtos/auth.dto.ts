import { type PublicUser, type UserRole } from '../../domain/entities/user.entity';

export interface RegisterInput {
  email: string;
  password: string;
  role: UserRole;
  firstName?: string | undefined;
  lastName?: string | undefined;
}

export interface LoginInput {
  email: string;
  password: string;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

export interface RefreshInput {
  refreshToken: string;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

export interface GoogleSignInInput {
  idToken: string;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}
