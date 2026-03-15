/**
 * App constants, enums, and config.
 * TypeScript enums match Prisma schema; use for forms, API, and display.
 */

export enum UserRole {
  owner = "owner",
  provider = "provider",
  rescue = "rescue",
  adopter = "adopter",
  admin = "admin",
}

export enum ServiceType {
  walking = "walking",
  sitting = "sitting",
  boarding = "boarding",
  drop_in = "drop_in",
  daycare = "daycare",
}

export enum BookingStatus {
  pending = "pending",
  accepted = "accepted",
  declined = "declined",
  active = "active",
  completed = "completed",
  cancelled = "cancelled",
}

export enum CancellationPolicy {
  flexible = "flexible",
  moderate = "moderate",
  strict = "strict",
}

export enum ClaimType {
  pet_injury = "pet_injury",
  property_damage = "property_damage",
  provider_no_show = "provider_no_show",
  owner_no_show = "owner_no_show",
}

export enum DisputeType {
  service_quality = "service_quality",
  pet_welfare = "pet_welfare",
  communication = "communication",
  payment = "payment",
}

export enum DisputeRuling {
  no_action = "no_action",
  warning = "warning",
  partial_refund = "partial_refund",
  full_refund = "full_refund",
  provider_suspended = "provider_suspended",
  owner_restricted = "owner_restricted",
}

export enum AdoptionListingStatus {
  available = "available",
  application_pending = "application_pending",
  matched = "matched",
  in_transit = "in_transit",
  adopted = "adopted",
}

export enum ApplicationStatus {
  new = "new",
  under_review = "under_review",
  approved = "approved",
  declined = "declined",
  withdrawn = "withdrawn",
}

export enum PlacementStatus {
  preparing = "preparing",
  vet_complete = "vet_complete",
  transport_booked = "transport_booked",
  in_transit = "in_transit",
  delivered = "delivered",
  follow_up = "follow_up",
}

export enum PayoutStatus {
  pending = "pending",
  processing = "processing",
  completed = "completed",
  failed = "failed",
}

export enum DonationSource {
  roundup = "roundup",
  signup = "signup",
  guardian = "guardian",
  platform_commission = "platform_commission",
}

export enum GuardianTier {
  friend = "friend",
  guardian = "guardian",
  champion = "champion",
  custom = "custom",
}

export enum GuardianStatus {
  active = "active",
  paused = "paused",
  cancelled = "cancelled",
}

export enum MeetAndGreetStatus {
  requested = "requested",
  confirmed = "confirmed",
  completed = "completed",
  cancelled = "cancelled",
  expired = "expired",
}

export enum LocationType {
  owner_home = "owner_home",
  provider_home = "provider_home",
  neutral = "neutral",
  video = "video",
}
