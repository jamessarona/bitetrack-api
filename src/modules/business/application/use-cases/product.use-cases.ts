import { inject, injectable } from 'tsyringe';
import { DI } from '@/infrastructure/di/tokens';
import { BadRequestError, NotFoundError } from '@/core/errors';
import { toPublicProduct, type PublicProduct } from '../../domain/entities/product.entity';
import {
  type BusinessRepository,
  type CreateProductInput,
  type ProductRepository,
  type UpdateProductInput,
} from '../../domain/repositories/business.repository';

@injectable()
export class ListBusinessProductsUseCase {
  constructor(
    @inject(DI.ProductRepository) private readonly products: ProductRepository,
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
  ) {}

  async execute(businessId: string, requesterUserId?: string): Promise<PublicProduct[]> {
    const business = await this.businesses.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    const isOwner = requesterUserId ? business.userId === requesterUserId : false;
    if (!isOwner && business.verificationStatus !== 'VERIFIED') {
      throw new NotFoundError('Business not found');
    }

    const rows = await this.products.listByBusiness(businessId);
    const visible = isOwner ? rows : rows.filter((product) => product.isAvailable);
    return visible.map(toPublicProduct);
  }
}

@injectable()
export class CreateProductUseCase {
  constructor(
    @inject(DI.ProductRepository) private readonly products: ProductRepository,
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
  ) {}

  async execute(
    businessId: string,
    userId: string,
    input: Omit<CreateProductInput, 'businessId'>,
  ): Promise<PublicProduct> {
    const owned = await this.businesses.isOwnedByUser(businessId, userId);
    if (!owned) {
      throw new NotFoundError('Business not found');
    }

    if (input.priceCents !== undefined && input.priceCents < 0) {
      throw new BadRequestError('priceCents must be zero or greater');
    }

    const product = await this.products.create({ ...input, businessId });
    return toPublicProduct(product);
  }
}

@injectable()
export class UpdateProductUseCase {
  constructor(
    @inject(DI.ProductRepository) private readonly products: ProductRepository,
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
  ) {}

  async execute(
    productId: string,
    userId: string,
    input: UpdateProductInput,
  ): Promise<PublicProduct> {
    const product = await this.products.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const owned = await this.businesses.isOwnedByUser(product.businessId, userId);
    if (!owned) {
      throw new NotFoundError('Product not found');
    }

    if (input.priceCents !== undefined && input.priceCents < 0) {
      throw new BadRequestError('priceCents must be zero or greater');
    }

    const updated = await this.products.update(productId, input);
    return toPublicProduct(updated);
  }
}

@injectable()
export class DeleteProductUseCase {
  constructor(
    @inject(DI.ProductRepository) private readonly products: ProductRepository,
    @inject(DI.BusinessRepository) private readonly businesses: BusinessRepository,
  ) {}

  async execute(productId: string, userId: string): Promise<void> {
    const product = await this.products.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const owned = await this.businesses.isOwnedByUser(product.businessId, userId);
    if (!owned) {
      throw new NotFoundError('Product not found');
    }

    await this.products.delete(productId);
  }
}
