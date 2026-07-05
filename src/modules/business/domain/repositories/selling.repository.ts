export interface SellingShiftRecord {
  id: string;
  businessId: string;
  status: 'ACTIVE' | 'ENDED';
  startedAt: Date;
  endedAt: Date | null;
}

export interface SellingStatus {
  isLive: boolean;
  shiftId: string | null;
  startedAt: Date | null;
  businessStatus: string;
  lastSeenAt: Date | null;
}

export interface SellingRepository {
  getSellingStatus(businessId: string): Promise<SellingStatus>;
  startSelling(businessId: string, latitude: number, longitude: number): Promise<SellingShiftRecord>;
  stopSelling(businessId: string): Promise<void>;
  updateLocation(
    businessId: string,
    input: {
      latitude: number;
      longitude: number;
      heading?: number | undefined;
      speed?: number | undefined;
    },
  ): Promise<void>;
}
