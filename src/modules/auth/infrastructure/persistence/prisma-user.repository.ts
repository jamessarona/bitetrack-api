import { inject, injectable } from 'tsyringe';
import { type PrismaClient } from '@prisma/client';
import { DI } from '@/infrastructure/di/tokens';
import {
  type CreateGoogleUserInput,
  type CreateUserInput,
  type LinkGoogleAccountInput,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import { type UserEntity } from '../../domain/entities/user.entity';

@injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(@inject(DI.PrismaClient) private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? this.toEntity(row) : null;
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { googleId } });
    return row ? this.toEntity(row) : null;
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    const row = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
      },
    });
    return this.toEntity(row);
  }

  async createGoogleUser(input: CreateGoogleUserInput): Promise<UserEntity> {
    const row = await this.prisma.user.create({
      data: {
        email: input.email,
        googleId: input.googleId,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        avatarUrl: input.avatarUrl ?? null,
        emailVerifiedAt: input.emailVerifiedAt ?? null,
      },
    });
    return this.toEntity(row);
  }

  async linkGoogleAccount(userId: string, input: LinkGoogleAccountInput): Promise<UserEntity> {
    const data: {
      googleId: string;
      avatarUrl?: string | null;
      emailVerifiedAt?: Date | null;
    } = { googleId: input.googleId };

    if (input.avatarUrl !== undefined) {
      data.avatarUrl = input.avatarUrl;
    }
    if (input.emailVerifiedAt !== undefined) {
      data.emailVerifiedAt = input.emailVerifiedAt;
    }

    const row = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return this.toEntity(row);
  }

  private toEntity(row: {
    id: string;
    email: string;
    passwordHash: string | null;
    googleId: string | null;
    role: UserEntity['role'];
    status: UserEntity['status'];
    firstName: string | null;
    lastName: string | null;
    emailVerifiedAt: Date | null;
    createdAt: Date;
  }): UserEntity {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      googleId: row.googleId,
      role: row.role,
      status: row.status,
      firstName: row.firstName,
      lastName: row.lastName,
      emailVerifiedAt: row.emailVerifiedAt,
      createdAt: row.createdAt,
    };
  }
}
