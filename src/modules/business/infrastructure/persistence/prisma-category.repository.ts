import { inject, injectable } from 'tsyringe';
import { type PrismaClient } from '@prisma/client';
import { DI } from '@/infrastructure/di/tokens';
import {
  type CategoryRecord,
  type CategoryRepository,
} from '../../domain/repositories/business.repository';

@injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(@inject(DI.PrismaClient) private readonly prisma: PrismaClient) {}

  async listAll(): Promise<CategoryRecord[]> {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<CategoryRecord | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }
}
