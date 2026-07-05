export interface ProductEntity {
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
}

export interface PublicProduct {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

export function toPublicProduct(product: ProductEntity): PublicProduct {
  return {
    id: product.id,
    businessId: product.businessId,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    currency: product.currency,
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
  };
}
