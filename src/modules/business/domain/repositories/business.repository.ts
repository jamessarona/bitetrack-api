import {
  type BusinessEntity,
  type BusinessStatus,
} from '../entities/business.entity';
import { type ProductEntity } from '../entities/product.entity';

export interface CreateBusinessInput {
  userId: string;
  slug: string;
  businessName: string;
  description?: string | null | undefined;
  categoryId?: string | null | undefined;
  logoUrl?: string | null | undefined;
  bannerUrl?: string | null | undefined;
}

export interface UpdateBusinessInput {
  businessName?: string | undefined;
  description?: string | null | undefined;
  categoryId?: string | null | undefined;
  logoUrl?: string | null | undefined;
  bannerUrl?: string | null | undefined;
  status?: BusinessStatus | undefined;
}

export interface CreateProductInput {
  businessId: string;
  name: string;
  description?: string | null | undefined;
  priceCents?: number | undefined;
  currency?: string | undefined;
  imageUrl?: string | null | undefined;
  isAvailable?: boolean | undefined;
}

export interface UpdateProductInput {
  name?: string | undefined;
  description?: string | null | undefined;
  priceCents?: number | undefined;
  currency?: string | undefined;
  imageUrl?: string | null | undefined;
  isAvailable?: boolean | undefined;
}

export interface BusinessRepository {
  findById(id: string): Promise<BusinessEntity | null>;
  findBySlug(slug: string): Promise<BusinessEntity | null>;
  findBySlugForOwner(slug: string, userId: string): Promise<BusinessEntity | null>;
  listByOwner(userId: string): Promise<BusinessEntity[]>;
  listPublic(params?: { categoryId?: string; limit?: number }): Promise<BusinessEntity[]>;
  slugExists(slug: string): Promise<boolean>;
  create(input: CreateBusinessInput): Promise<BusinessEntity>;
  update(id: string, input: UpdateBusinessInput): Promise<BusinessEntity>;
  delete(id: string): Promise<void>;
  isOwnedByUser(businessId: string, userId: string): Promise<boolean>;
}

export interface ProductRepository {
  findById(id: string): Promise<ProductEntity | null>;
  listByBusiness(businessId: string): Promise<ProductEntity[]>;
  create(input: CreateProductInput): Promise<ProductEntity>;
  update(id: string, input: UpdateProductInput): Promise<ProductEntity>;
  delete(id: string): Promise<void>;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
}

export interface CategoryRepository {
  listAll(): Promise<CategoryRecord[]>;
  findById(id: string): Promise<CategoryRecord | null>;
}
