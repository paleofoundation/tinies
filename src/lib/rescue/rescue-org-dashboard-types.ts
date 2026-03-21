export type OrgListingRow = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  estimatedAge: string | null;
  status: string;
  active: boolean;
  slug: string;
  photos: string[];
};

export type OrgApplicationRow = {
  id: string;
  status: string;
  createdAt: Date;
  country: string;
  city: string;
  livingSituation: string | null;
  hasGarden: boolean | null;
  otherPets: string | null;
  childrenAges: string | null;
  experience: string | null;
  reason: string | null;
  vetReference: string | null;
  applicantName: string;
  listingName: string;
  listingSlug: string;
};

export type OrgPlacementRow = {
  id: string;
  status: string;
  destinationCountry: string;
  listingName: string;
  adopterName: string;
  createdAt: Date;
  awaitingGalleryApproval: boolean;
};

export type UpdateOrgProfileInput = {
  name?: string;
  mission?: string;
  location?: string;
  website?: string;
  socialLinks?: string;
  logoUrl?: string;
};
