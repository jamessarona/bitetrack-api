import { randomUUID } from 'node:crypto';
import { inject, injectable } from 'tsyringe';
import { type PrismaClient } from '@prisma/client';
import { DI } from '@/infrastructure/di/tokens';
import { BadRequestError, NotFoundError } from '@/core/errors';
import {
  type SellingRepository,
  type SellingShiftRecord,
  type SellingStatus,
} from '../../domain/repositories/selling.repository';

@injectable()
export class PrismaSellingRepository implements SellingRepository {
  constructor(@inject(DI.PrismaClient) private readonly prisma: PrismaClient) {}

  async getSellingStatus(businessId: string): Promise<SellingStatus> {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    const shift = await this.prisma.businessShift.findFirst({
      where: { businessId, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    });

    return {
      isLive: shift != null && business.status !== 'OFFLINE',
      shiftId: shift?.id ?? null,
      startedAt: shift?.startedAt ?? null,
      businessStatus: business.status,
      lastSeenAt: business.lastSeenAt,
    };
  }

  async startSelling(
    businessId: string,
    latitude: number,
    longitude: number,
  ): Promise<SellingShiftRecord> {
    return this.prisma.$transaction(async (tx) => {
      const business = await tx.business.findUnique({ where: { id: businessId } });
      if (!business) {
        throw new NotFoundError('Business not found');
      }

      const existing = await tx.businessShift.findFirst({
        where: { businessId, status: 'ACTIVE' },
      });
      if (existing) {
        throw new BadRequestError('This business is already live on the map');
      }

      const shiftId = randomUUID();
      const now = new Date();

      await tx.businessShift.create({
        data: {
          id: shiftId,
          businessId,
          status: 'ACTIVE',
          startedAt: now,
        },
      });

      await tx.business.update({
        where: { id: businessId },
        data: { status: 'AVAILABLE', lastSeenAt: now },
      });

      await tx.$executeRaw`
        UPDATE "bitetrack_dev"."businesses"
        SET "lastLocation" = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            "updatedAt" = ${now}
        WHERE "id" = ${businessId}::uuid
      `;

      await tx.$executeRaw`
        INSERT INTO "bitetrack_dev"."business_location_pings" ("id", "shiftId", "location", "recordedAt")
        VALUES (
          ${randomUUID()}::uuid,
          ${shiftId}::uuid,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${now}
        )
      `;

      return {
        id: shiftId,
        businessId,
        status: 'ACTIVE',
        startedAt: now,
        endedAt: null,
      };
    });
  }

  async stopSelling(businessId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const shift = await tx.businessShift.findFirst({
        where: { businessId, status: 'ACTIVE' },
      });
      if (!shift) {
        throw new BadRequestError('This business is not live on the map');
      }

      const now = new Date();
      await tx.businessShift.update({
        where: { id: shift.id },
        data: { status: 'ENDED', endedAt: now },
      });

      await tx.business.update({
        where: { id: businessId },
        data: { status: 'OFFLINE' },
      });
    });
  }

  async updateLocation(
    businessId: string,
    input: {
      latitude: number;
      longitude: number;
      heading?: number | undefined;
      speed?: number | undefined;
    },
  ): Promise<void> {
    const shift = await this.prisma.businessShift.findFirst({
      where: { businessId, status: 'ACTIVE' },
    });
    if (!shift) {
      throw new BadRequestError('Start selling before sharing your location');
    }

    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE "bitetrack_dev"."businesses"
      SET "lastLocation" = ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography,
          "lastSeenAt" = ${now},
          "updatedAt" = ${now}
      WHERE "id" = ${businessId}::uuid
    `;

    await this.prisma.$executeRaw`
      INSERT INTO "bitetrack_dev"."business_location_pings" ("id", "shiftId", "location", "heading", "speed", "recordedAt")
      VALUES (
        ${randomUUID()}::uuid,
        ${shift.id}::uuid,
        ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography,
        ${input.heading ?? null},
        ${input.speed ?? null},
        ${now}
      )
    `;
  }
}
