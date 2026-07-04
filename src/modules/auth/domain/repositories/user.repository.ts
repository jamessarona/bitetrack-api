import { type UserEntity, type UserRole } from '../entities/user.entity';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName?: string | undefined;
  lastName?: string | undefined;
}

export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(input: CreateUserInput): Promise<UserEntity>;
}
