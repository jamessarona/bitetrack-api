import { randomUUID } from 'node:crypto';
import { inject, injectable } from 'tsyringe';
import { DI } from '@/infrastructure/di/tokens';
import { slugify, withUniqueSuffix } from '@/core/utils/slug';
import { BadRequestError, NotFoundError } from '@/core/errors';
import { toPublicBusiness, type PublicBusiness, toPublicBusinessNearby } from '../../domain/entities/business.entity';
import {
  type BusinessRepository,
  type CategoryRepository,
  type CreateBusinessInput,
  type UpdateBusinessInput,
} from '../../domain/repositories/business.repository';

export interface CreateBusinessCommand {
  userId: string;
  businessName: string;
  description?: string | null | undefined;
  categoryId?: string | null | undefined;
  logoUrl?: string | null | undefined;
  bannerUrl?: string | null | undefined;
}

@injectable()
export class CreateBusinessUseCase {
  constructor(
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
    @inject(DI.CategoryRepository) private readonly categories: CategoryRepository,
  ) {}

  async execute(input: CreateBusinessCommand): Promise<PublicBusiness> {
    if (input.categoryId) {
      const category = await this.categories.findById(input.categoryId);
      if (!category) {
        throw new BadRequestError('Invalid category');
      }
    }

    const baseSlug = slugify(input.businessName);
    const slug = await this.generateUniqueSlug(baseSlug);

    const payload: CreateBusinessInput = {
      userId: input.userId,
      slug,
      businessName: input.businessName.trim(),
      description: input.description ?? null,
      categoryId: input.categoryId ?? null,
      logoUrl: input.logoUrl ?? null,
      bannerUrl: input.bannerUrl ?? null,
    };

    const business = await this.businesses.create(payload);
    return toPublicBusiness(business);
  }

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let candidate = baseSlug.length > 0 ? baseSlug : 'business';
    if (!(await this.businesses.slugExists(candidate))) {
      return candidate;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      candidate = withUniqueSuffix(baseSlug, randomUUID());
      if (!(await this.businesses.slugExists(candidate))) {
        return candidate;
      }
    }

    return withUniqueSuffix(baseSlug, randomUUID());
  }
}

@injectable()
export class ListMyBusinessesUseCase {
  constructor(@inject(DI.BusinessRepository) private readonly businesses: BusinessRepository) {}

  async execute(userId: string): Promise<PublicBusiness[]> {
    const rows = await this.businesses.listByOwner(userId);
    return rows.map(toPublicBusiness);
  }
}

@injectable()
export class GetBusinessBySlugUseCase {
  constructor(@inject(DI.BusinessRepository) private readonly businesses: BusinessRepository) {}

  async execute(slug: string): Promise<PublicBusiness> {
    const business = await this.businesses.findBySlug(slug);
    if (!business) {
      throw new NotFoundError('Business not found');
    }
    return toPublicBusiness(business);
  }
}

@injectable()
export class ListPublicBusinessesUseCase {
  constructor(@inject(DI.BusinessRepository) private readonly businesses: BusinessRepository) {}

  async execute(params?: { categoryId?: string; limit?: number }): Promise<PublicBusiness[]> {
    const rows = await this.businesses.listPublic(params);
    return rows.map(toPublicBusiness);
  }
}

@injectable()
export class ListNearbyBusinessesUseCase {
  constructor(@inject(DI.BusinessRepository) private readonly businesses: BusinessRepository) {}

  async execute(params: {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    limit?: number;
  }): Promise<PublicBusiness[]> {
    if (Number.isNaN(params.latitude) || Number.isNaN(params.longitude)) {
      throw new BadRequestError('lat and lng query parameters are required');
    }

    const rows = await this.businesses.listNearbyPublic(params);
    return rows.map(toPublicBusinessNearby);
  }
}

@injectable()
export class UpdateBusinessUseCase {
  constructor(@inject(DI.BusinessRepository) private readonly businesses: BusinessRepository) {}

  async execute(
    businessId: string,
    userId: string,
    input: UpdateBusinessInput,
  ): Promise<PublicBusiness> {
    const owned = await this.businesses.isOwnedByUser(businessId, userId);
    if (!owned) {
      throw new NotFoundError('Business not found');
    }

    const business = await this.businesses.update(businessId, input);
    return toPublicBusiness(business);
  }
}

@injectable()
export class DeleteBusinessUseCase {
  constructor(@inject(DI.BusinessRepository) private readonly businesses: BusinessRepository) {}

  async execute(businessId: string, userId: string): Promise<void> {
    const owned = await this.businesses.isOwnedByUser(businessId, userId);
    if (!owned) {
      throw new NotFoundError('Business not found');
    }
    await this.businesses.delete(businessId);
  }
}

@injectable()
export class ListCategoriesUseCase {
  constructor(@inject(DI.CategoryRepository) private readonly categories: CategoryRepository) {}

  async execute() {
    return this.categories.listAll();
  }
}
