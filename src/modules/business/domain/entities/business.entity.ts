import { type BusinessStatus, type BusinessVerificationStatus } from '@prisma/client';

export type { BusinessStatus, BusinessVerificationStatus };

export interface BusinessEntity {
  id: string;
  userId: string;
  categoryId: string | null;
  slug: string;
  businessName: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  verificationStatus: BusinessVerificationStatus;
  status: BusinessStatus;
  averageRating: number;
  reviewCount: number;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicBusiness {
  id: string;
  slug: string;
  businessName: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  verificationStatus: BusinessVerificationStatus;
  status: BusinessStatus;
  averageRating: number;
  reviewCount: number;
  categoryId: string | null;
}

export function toPublicBusiness(business: BusinessEntity): PublicBusiness {
  return {
    id: business.id,
    slug: business.slug,
    businessName: business.businessName,
    description: business.description,
    logoUrl: business.logoUrl,
    bannerUrl: business.bannerUrl,
    verificationStatus: business.verificationStatus,
    status: business.status,
    averageRating: business.averageRating,
    reviewCount: business.reviewCount,
    categoryId: business.categoryId,
  };
}
