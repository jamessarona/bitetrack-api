export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type ThemePreference = 'LIGHT' | 'DARK' | 'SYSTEM';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  role: UserRole;
  status: UserStatus;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  emailVerifiedAt: Date | null;
  themePreference: ThemePreference;
  createdAt: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  themePreference: ThemePreference;
}

export function toPublicUser(user: UserEntity): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    themePreference: user.themePreference,
  };
}
