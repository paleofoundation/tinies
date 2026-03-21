export type AdopterApplicationSummary = {
  id: string;
  status: string;
  createdAt: Date;
  listing: {
    name: string;
    species: string;
    slug: string;
  };
  /** When application is approved, the active placement with full tracking fields. */
  placement?: {
    id: string;
    status: string;
    destinationCountry: string;
    vetPrepStatus: unknown;
    transportMethod: string | null;
    transportProviderName: string | null;
    transportBookedDate: Date | null;
    departureDate: Date | null;
    arrivalDate: Date | null;
    checkin1w: Date | null;
    checkin1m: Date | null;
    checkin3m: Date | null;
    createdAt: Date;
  };
};
