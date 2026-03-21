import type { PlacementStatus, Prisma } from "@prisma/client";

export type PlacementRow = {
  id: string;
  status: string;
  destinationCountry: string;
  createdAt: Date;
  daysSinceCreated: number;
  listingName: string;
  adopterName: string;
};

export type PlacementDetail = {
  id: string;
  status: string;
  destinationCountry: string;
  vetPrepStatus: unknown;
  transportMethod: string | null;
  transportProviderId: string | null;
  transportBookedDate: Date | null;
  departureDate: Date | null;
  arrivalDate: Date | null;
  vetCost: number | null;
  transportCost: number | null;
  coordinationFee: number | null;
  totalFee: number;
  checkin1w: Date | null;
  checkin1m: Date | null;
  checkin3m: Date | null;
  successStoryText: string | null;
  successStoryPhotos: string[];
  successStoryApprovedAt: Date | null;
  createdAt: Date;
  listing: { name: string; species: string; breed: string | null; estimatedAge: string | null };
  adopter: { name: string; email: string };
  rescueOrg: { name: string };
};

export type UpdatePlacementData = {
  vetPrepStatus?: Prisma.InputJsonValue;
  transportMethod?: string | null;
  transportProviderId?: string | null;
  transportBookedDate?: string | null;
  departureDate?: string | null;
  arrivalDate?: string | null;
  vetCost?: number | null;
  transportCost?: number | null;
  coordinationFee?: number | null;
  status?: PlacementStatus;
};

export type TransportProviderRow = {
  id: string;
  name: string;
  type: string;
  countriesServed: string[];
  contactInfo: string | null;
  pricingNotes: string | null;
  rating: number | null;
  active: boolean;
};

export type TransportProviderInput = {
  name: string;
  type: string;
  countriesServed: string[];
  contactInfo?: string | null;
  pricingNotes?: string | null;
  rating?: number | null;
  active: boolean;
};
