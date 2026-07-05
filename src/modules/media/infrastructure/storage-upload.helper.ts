import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { BadRequestError } from '@/core/errors';
import {
  type BusinessRepository,
  type ProductRepository,
} from '@/modules/business/domain/repositories/business.repository';
import { type CreateUploadSessionInput } from '../application/ports/object-storage';

export const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export function assertAllowedContentType(contentType: string): void {
  if (!ALLOWED_IMAGE_CONTENT_TYPES.has(contentType)) {
    throw new BadRequestError('Unsupported image content type');
  }
}

export async function assertUploadAccess(
  input: CreateUploadSessionInput,
  businesses: BusinessRepository,
  products: ProductRepository,
): Promise<void> {
  if (input.purpose === 'business_logo' || input.purpose === 'business_banner') {
    if (!input.businessId) {
      throw new BadRequestError('businessId is required for business media uploads');
    }
    const owned = await businesses.isOwnedByUser(input.businessId, input.userId);
    if (!owned) {
      throw new BadRequestError('You do not own this business');
    }
    return;
  }

  if (input.purpose === 'product_image') {
    if (!input.productId) {
      throw new BadRequestError('productId is required for product image uploads');
    }
    const product = await products.findById(input.productId);
    if (!product) {
      throw new BadRequestError('Product not found');
    }
    const owned = await businesses.isOwnedByUser(product.businessId, input.userId);
    if (!owned) {
      throw new BadRequestError('You do not own this product');
    }
  }
}

export function buildObjectKey(input: CreateUploadSessionInput, extension: string): string {
  const fileName = `${randomUUID()}${extension}`;

  if (input.purpose === 'product_image' && input.productId) {
    return path.posix.join('products', input.productId, fileName);
  }

  if (input.businessId) {
    const folder = input.purpose === 'business_banner' ? 'banners' : 'logos';
    return path.posix.join('businesses', input.businessId, folder, fileName);
  }

  return path.posix.join('uploads', input.userId, fileName);
}

export function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '';
  }
}
