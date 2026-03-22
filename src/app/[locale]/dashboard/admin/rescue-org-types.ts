export type RescueOrgRow = {
  id: string;
  name: string;
  location: string | null;
  verified: boolean;
  listingCount: number;
  createdAt: Date;
  slug: string;
};

import type { ParsedRescueTeamMember } from "@/lib/validations/rescue-org-showcase";

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
  /** Login email (User.email) */
  accountEmail: string;
  description: string | null;
  foundedYear: number | null;
  teamMembers: ParsedRescueTeamMember[];
  facilityPhotos: string[];
  facilityVideoUrl: string | null;
  operatingHours: string | null;
  volunteerInfo: string | null;
  donationNeeds: string | null;
  totalAnimalsRescued: number | null;
  totalAnimalsAdopted: number | null;
  contactPhone: string | null;
  publicContactEmail: string | null;
  district: string | null;
  coverPhotoUrl: string | null;
};
