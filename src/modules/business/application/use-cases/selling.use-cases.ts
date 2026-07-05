import { inject, injectable } from 'tsyringe';
import { DI } from '@/infrastructure/di/tokens';
import { BadRequestError, NotFoundError } from '@/core/errors';
import { toPublicBusiness, type PublicBusiness } from '../../domain/entities/business.entity';
import { type BusinessRepository } from '../../domain/repositories/business.repository';
import {
  type SellingRepository,
  type SellingStatus,
} from '../../domain/repositories/selling.repository';

export interface OwnerBusiness extends PublicBusiness {
  isLive: boolean;
  activeShiftId: string | null;
  lastSeenAt: string | null;
}

function toOwnerBusiness(
  business: Awaited<ReturnType<BusinessRepository['findById']>> & object,
  selling: SellingStatus,
): OwnerBusiness {
  if (!business) {
    throw new NotFoundError('Business not found');
  }

  return {
    ...toPublicBusiness(business),
    isLive: selling.isLive,
    activeShiftId: selling.shiftId,
    lastSeenAt: selling.lastSeenAt?.toISOString() ?? null,
  };
}

@injectable()
export class GetSellingStatusUseCase {
  constructor(
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
    @inject(DI.SellingRepository) private readonly selling: SellingRepository,
  ) {}

  async execute(businessId: string, userId: string): Promise<OwnerBusiness> {
    await this.assertOwner(businessId, userId);
    const business = await this.businesses.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }
    const status = await this.selling.getSellingStatus(businessId);
    return toOwnerBusiness(business, status);
  }

  private async assertOwner(businessId: string, userId: string): Promise<void> {
    const owned = await this.businesses.isOwnedByUser(businessId, userId);
    if (!owned) {
      throw new NotFoundError('Business not found');
    }
  }
}

@injectable()
export class StartSellingUseCase {
  constructor(
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
    @inject(DI.SellingRepository) private readonly selling: SellingRepository,
  ) {}

  async execute(
    businessId: string,
    userId: string,
    input: { latitude: number; longitude: number },
  ): Promise<OwnerBusiness> {
    const owned = await this.businesses.isOwnedByUser(businessId, userId);
    if (!owned) {
      throw new NotFoundError('Business not found');
    }

    const business = await this.businesses.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    if (business.verificationStatus !== 'VERIFIED') {
      throw new BadRequestError('Your business must be verified before you can go live');
    }

    if (Number.isNaN(input.latitude) || Number.isNaN(input.longitude)) {
      throw new BadRequestError('latitude and longitude are required');
    }

    await this.selling.startSelling(businessId, input.latitude, input.longitude);
    const updated = await this.businesses.findById(businessId);
    const status = await this.selling.getSellingStatus(businessId);
    return toOwnerBusiness(updated!, status);
  }
}

@injectable()
export class StopSellingUseCase {
  constructor(
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
    @inject(DI.SellingRepository) private readonly selling: SellingRepository,
  ) {}

  async execute(businessId: string, userId: string): Promise<OwnerBusiness> {
    const owned = await this.businesses.isOwnedByUser(businessId, userId);
    if (!owned) {
      throw new NotFoundError('Business not found');
    }

    await this.selling.stopSelling(businessId);
    const updated = await this.businesses.findById(businessId);
    const status = await this.selling.getSellingStatus(businessId);
    return toOwnerBusiness(updated!, status);
  }
}

@injectable()
export class UpdateSellingLocationUseCase {
  constructor(
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
    @inject(DI.SellingRepository) private readonly selling: SellingRepository,
  ) {}

  async execute(
    businessId: string,
    userId: string,
    input: {
      latitude: number;
      longitude: number;
      heading?: number | undefined;
      speed?: number | undefined;
    },
  ): Promise<OwnerBusiness> {
    const owned = await this.businesses.isOwnedByUser(businessId, userId);
    if (!owned) {
      throw new NotFoundError('Business not found');
    }

    if (Number.isNaN(input.latitude) || Number.isNaN(input.longitude)) {
      throw new BadRequestError('latitude and longitude are required');
    }

    await this.selling.updateLocation(businessId, input);
    const updated = await this.businesses.findById(businessId);
    const status = await this.selling.getSellingStatus(businessId);
    return toOwnerBusiness(updated!, status);
  }
}

@injectable()
export class ListMyBusinessesWithLiveStatusUseCase {
  constructor(
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
    @inject(DI.SellingRepository) private readonly selling: SellingRepository,
  ) {}

  async execute(userId: string): Promise<OwnerBusiness[]> {
    const rows = await this.businesses.listByOwner(userId);
    const results: OwnerBusiness[] = [];

    for (const business of rows) {
      const status = await this.selling.getSellingStatus(business.id);
      results.push(toOwnerBusiness(business, status));
    }

    return results;
  }
}
