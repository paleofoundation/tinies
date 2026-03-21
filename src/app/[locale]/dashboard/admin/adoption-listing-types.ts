export type CreateListingInput = {
  name: string;
  species: string;
  breed?: string;
  estimatedAge?: string;
  sex?: string;
  spayedNeutered: boolean;
  temperament?: string;
  medicalHistory?: string;
  specialNeeds?: string;
  localAdoptionFeeEur?: number;
  internationalEligible: boolean;
  destinationCountries: string[];
  photoUrls: string[];
  status: string;
};

export type UpdateListingInput = CreateListingInput;
