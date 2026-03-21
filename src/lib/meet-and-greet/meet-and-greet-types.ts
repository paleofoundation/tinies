import type { LocationType } from "@prisma/client";

export type RequestMeetAndGreetInput = {
  providerSlug: string;
  petIds: string[];
  requestedDatetime: string; // ISO
  locationType: LocationType;
  locationNotes?: string | null;
};

export type MeetAndGreetResponseAction = "accept" | "suggest" | "decline";

export type RespondToMeetAndGreetInput = {
  action: MeetAndGreetResponseAction;
  suggestedDatetime?: string | null; // ISO, for suggest
  message?: string | null; // for suggest or decline
};

export type ProviderMeetAndGreetCard = {
  id: string;
  ownerName: string;
  petNames: string[];
  requestedDatetime: Date;
  confirmedDatetime: Date | null;
  locationType: string;
  locationNotes: string | null;
  status: string;
  providerSuggestedDatetime: Date | null;
  providerMessage: string | null;
  createdAt: Date;
  providerSlug: string;
};

export type OwnerMeetAndGreetCard = {
  id: string;
  providerName: string;
  providerSlug: string;
  petNames: string[];
  requestedDatetime: Date;
  confirmedDatetime: Date | null;
  locationType: string;
  locationNotes: string | null;
  status: string;
  providerSuggestedDatetime: Date | null;
  providerMessage: string | null;
  createdAt: Date;
  ledToBooking: boolean;
  bookingId: string | null;
};
