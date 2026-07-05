import { randomUUID } from 'node:crypto';
import { inject, injectable } from 'tsyringe';
import { type PrismaClient } from '@prisma/client';
import { DI } from '@/infrastructure/di/tokens';
import { type ProductEntity } from '../../domain/entities/product.entity';
import {
  type CreateProductInput,
  type ProductRepository,
  type UpdateProductInput,
} from '../../domain/repositories/business.repository';

@injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(@inject(DI.PrismaClient) private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ProductEntity | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async listByBusiness(businessId: string): Promise<ProductEntity[]> {
    const rows = await this.prisma.product.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async create(input: CreateProductInput): Promise<ProductEntity> {
    const row = await this.prisma.product.create({
      data: {
        id: randomUUID(),
        businessId: input.businessId,
        name: input.name,
        description: input.description ?? null,
        priceCents: input.priceCents ?? 0,
        currency: input.currency ?? 'PHP',
        imageUrl: input.imageUrl ?? null,
        isAvailable: input.isAvailable ?? true,
      },
    });
    return this.toEntity(row);
  }

  async update(id: string, input: UpdateProductInput): Promise<ProductEntity> {
    const row = await this.prisma.product.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.priceCents !== undefined ? { priceCents: input.priceCents } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.isAvailable !== undefined ? { isAvailable: input.isAvailable } : {}),
      },
    });
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  private toEntity(row: {
    id: string;
    businessId: string;
    name: string;
    description: string | null;
    priceCents: number;
    currency: string;
    imageUrl: string | null;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ProductEntity {
    return { ...row };
  }
}
