import { randomUUID } from 'node:crypto';
import { inject, injectable } from 'tsyringe';
import { type PrismaClient } from '@prisma/client';
import { DI } from '@/infrastructure/di/tokens';
import { type BusinessEntity } from '../../domain/entities/business.entity';
import {
  type BusinessRepository,
  type CreateBusinessInput,
  type UpdateBusinessInput,
} from '../../domain/repositories/business.repository';

@injectable()
export class PrismaBusinessRepository implements BusinessRepository {
  constructor(@inject(DI.PrismaClient) private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<BusinessEntity | null> {
    const row = await this.prisma.business.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<BusinessEntity | null> {
    const row = await this.prisma.business.findUnique({ where: { slug } });
    return row ? this.toEntity(row) : null;
  }

  async findBySlugForOwner(slug: string, userId: string): Promise<BusinessEntity | null> {
    const row = await this.prisma.business.findFirst({ where: { slug, userId } });
    return row ? this.toEntity(row) : null;
  }

  async listByOwner(userId: string): Promise<BusinessEntity[]> {
    const rows = await this.prisma.business.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async listPublic(params?: { categoryId?: string; limit?: number }): Promise<BusinessEntity[]> {
    const rows = await this.prisma.business.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        ...(params?.categoryId ? { categoryId: params.categoryId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: params?.limit ?? 50,
    });
    return rows.map((row) => this.toEntity(row));
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.prisma.business.count({ where: { slug } });
    return count > 0;
  }

  async create(input: CreateBusinessInput): Promise<BusinessEntity> {
    const row = await this.prisma.business.create({
      data: {
        id: randomUUID(),
        userId: input.userId,
        slug: input.slug,
        businessName: input.businessName,
        description: input.description ?? null,
        categoryId: input.categoryId ?? null,
        logoUrl: input.logoUrl ?? null,
        bannerUrl: input.bannerUrl ?? null,
      },
    });
    return this.toEntity(row);
  }

  async update(id: string, input: UpdateBusinessInput): Promise<BusinessEntity> {
    const row = await this.prisma.business.update({
      where: { id },
      data: {
        ...(input.businessName !== undefined ? { businessName: input.businessName } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.bannerUrl !== undefined ? { bannerUrl: input.bannerUrl } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.business.delete({ where: { id } });
  }

  async isOwnedByUser(businessId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.business.count({ where: { id: businessId, userId } });
    return count > 0;
  }

  async countByOwner(userId: string): Promise<number> {
    return this.prisma.business.count({ where: { userId } });
  }

  async listNearbyPublic(params: {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    limit?: number;
  }): Promise<
    Array<
      BusinessEntity & { latitude: number; longitude: number; distanceMeters: number }
    >
  > {
    const radiusMeters = params.radiusMeters ?? 5_000;
    const limit = params.limit ?? 50;

    const rows = await this.prisma.$queryRaw<
      Array<{
        id: string;
        userId: string;
        categoryId: string | null;
        slug: string;
        businessName: string;
        description: string | null;
        logoUrl: string | null;
        bannerUrl: string | null;
        verificationStatus: BusinessEntity['verificationStatus'];
        status: BusinessEntity['status'];
        averageRating: number;
        reviewCount: number;
        lastSeenAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        latitude: number;
        longitude: number;
        distanceMeters: number;
      }>
    >`
      SELECT
        b."id",
        b."userId",
        b."categoryId",
        b."slug",
        b."businessName",
        b."description",
        b."logoUrl",
        b."bannerUrl",
        b."verificationStatus",
        b."status",
        b."averageRating",
        b."reviewCount",
        b."lastSeenAt",
        b."createdAt",
        b."updatedAt",
        ST_Y(b."lastLocation"::geometry) AS latitude,
        ST_X(b."lastLocation"::geometry) AS longitude,
        ST_Distance(
          b."lastLocation",
          ST_SetSRID(ST_MakePoint(${params.longitude}, ${params.latitude}), 4326)::geography
        ) AS "distanceMeters"
      FROM "bitetrack_dev"."businesses" b
      WHERE b."verificationStatus"::text = 'VERIFIED'
        AND b."status" IN ('ONLINE', 'AVAILABLE', 'ON_ROUTE', 'BUSY')
        AND b."lastLocation" IS NOT NULL
        AND ST_DWithin(
          b."lastLocation",
          ST_SetSRID(ST_MakePoint(${params.longitude}, ${params.latitude}), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY "distanceMeters" ASC
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      categoryId: row.categoryId,
      slug: row.slug,
      businessName: row.businessName,
      description: row.description,
      logoUrl: row.logoUrl,
      bannerUrl: row.bannerUrl,
      verificationStatus: row.verificationStatus,
      status: row.status,
      averageRating: row.averageRating,
      reviewCount: row.reviewCount,
      lastSeenAt: row.lastSeenAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      latitude: row.latitude,
      longitude: row.longitude,
      distanceMeters: row.distanceMeters,
    }));
  }

  private toEntity(row: {
    id: string;
    userId: string;
    categoryId: string | null;
    slug: string;
    businessName: string;
    description: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    verificationStatus: BusinessEntity['verificationStatus'];
    status: BusinessEntity['status'];
    averageRating: number;
    reviewCount: number;
    lastSeenAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): BusinessEntity {
    return { ...row };
  }
}
