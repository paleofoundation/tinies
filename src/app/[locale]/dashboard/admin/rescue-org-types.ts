export type RescueOrgRow = {
  id: string;
  name: string;
  location: string | null;
  verified: boolean;
  listingCount: number;
  createdAt: Date;
  slug: string;
};

export type RescueOrgDetail = {
  id: string;
  userId: string;
  name: string;
  mission: string | null;
  location: string | null;
  charityRegistration: string | null;
  website: string | null;
  socialLinks: unknown;
  logoUrl: string | null;
  bankIban: string | null;
  verified: boolean;
  slug: string;
  contactEmail: string;
};
