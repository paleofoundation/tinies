export type CreateListingInput = {
  name: string;
  species: string;
  breed?: string;
  estimatedAge?: string;
  sex?: string;
  spayedNeutered: boolean;
  alternateNames: string[];
  nameStory?: string;
  temperament?: string;
  medicalHistory?: string;
  specialNeeds?: string;
  backstory?: string;
  personality?: string;
  idealHome?: string;
  goodWith: string[];
  notGoodWith: string[];
  videoUrl?: string;
  fosterLocation?: string;
  lineageTitle?: string;
  /** AdoptionListing.id of mother on Tinies, or empty */
  motherId?: string;
  fatherId?: string;
  motherName?: string;
  fatherName?: string;
  siblingIds: string[];
  familyNotes?: string;
  localAdoptionFeeEur?: number;
  internationalEligible: boolean;
  destinationCountries: string[];
  photoUrls: string[];
  status: string;
};

/** Dropdown options for mother/father/siblings (loaded on server). */
export type AdoptionListingPeerOption = {
  id: string;
  slug: string;
  name: string;
  photo: string | null;
};

export type UpdateListingInput = CreateListingInput;
