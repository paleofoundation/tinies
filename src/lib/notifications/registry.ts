/**
 * Single source of truth: which channel(s) each notification uses.
 * Template components live in src/lib/email/templates/.
 * SMS bodies are built in src/lib/sms/index.ts.
 *
 * Cron: see src/lib/notifications/cron-scheduled-tasks.ts
 */

export type NotificationChannel = "email" | "sms" | "both";

export const NotificationTrigger = {
  BOOKING_REQUEST: "booking.request",
  BOOKING_ACCEPTED: "booking.accepted",
  BOOKING_DECLINED: "booking.declined",
  BOOKING_EXPIRED: "booking.expired",
  BOOKING_REMINDER_24H: "booking.reminder_24h",
  BOOKING_SERVICE_STARTED: "booking.service_started",
  WALK_TRACKING_STARTED: "booking.walk_tracking_started",
  BOOKING_COMPLETED: "booking.completed",
  REVIEW_PROMPT_24H: "review.prompt_24h",
  REVIEW_RECEIVED: "review.received",
  PAYMENT_RECEIPT: "payment.receipt",
  PAYOUT_PROCESSED: "payout.processed",
  OWNER_CANCELLED: "booking.owner_cancelled",
  PROVIDER_CANCELLED: "booking.provider_cancelled",
  ADOPTION_APPLICATION_RECEIVED: "adoption.application_received",
  ADOPTION_STATUS_UPDATE: "adoption.status_update",
  ADOPTION_PLACEMENT_MILESTONE: "adoption.placement_milestone",
  POST_ADOPTION_1W: "adoption.post_checkin_1w",
  POST_ADOPTION_1M: "adoption.post_checkin_1m",
  POST_ADOPTION_3M: "adoption.post_checkin_3m",
  SIGNUP_DONATION_THANK_YOU: "giving.signup_donation",
  GUARDIAN_WELCOME: "giving.guardian_welcome",
  GUARDIAN_MONTHLY_CHARGE: "giving.guardian_monthly",
  GUARDIAN_PAUSED: "giving.guardian_paused",
  GUARDIAN_CANCELLED: "giving.guardian_cancelled",
  MONTHLY_GIVING_RECEIPT: "giving.monthly_receipt",
  GUARANTEE_CLAIM_FILED: "trust.claim_filed",
  DISPUTE_OPENED: "trust.dispute_opened",
  CASE_RESOLVED: "trust.case_resolved",
  NEW_MESSAGE: "messaging.new_message",
  CHARITY_PAYOUT: "giving.charity_payout",
} as const;

export type NotificationTriggerId = (typeof NotificationTrigger)[keyof typeof NotificationTrigger];

type Entry = {
  channels: NotificationChannel;
  emailTemplate: string;
  smsBuilder?: string;
  /** Human-readable: what invokes this (cron route name, server action, webhook). */
  trigger: string;
  cronNote?: string;
};

export const NOTIFICATION_REGISTRY: Record<NotificationTriggerId, Entry> = {
  [NotificationTrigger.BOOKING_REQUEST]: {
    channels: "both",
    emailTemplate: "booking-request.tsx",
    smsBuilder: "buildBookingRequestSMS",
    trigger: "createBookingWithPaymentIntent (services/book/actions)",
  },
  [NotificationTrigger.BOOKING_ACCEPTED]: {
    channels: "both",
    emailTemplate: "booking-accepted.tsx + payment-receipt.tsx",
    smsBuilder: "buildBookingAcceptedSMS",
    trigger: "acceptBooking (dashboard/provider/actions)",
  },
  [NotificationTrigger.BOOKING_DECLINED]: {
    channels: "email",
    emailTemplate: "booking-declined.tsx",
    trigger: "declineBooking (dashboard/provider/actions)",
  },
  [NotificationTrigger.BOOKING_EXPIRED]: {
    channels: "both",
    emailTemplate: "booking-expired.tsx",
    smsBuilder: "buildBookingExpiredSMS",
    trigger: "expireStaleBookings (dashboard/provider/actions)",
  },
  [NotificationTrigger.BOOKING_REMINDER_24H]: {
    channels: "both",
    emailTemplate: "booking-reminder.tsx",
    smsBuilder: "buildBookingReminderSMS",
    trigger: "runBookingReminderCron (notifications/cron-scheduled-tasks)",
    cronNote: "Schedule hourly; targets bookings starting in ~24h.",
  },
  [NotificationTrigger.BOOKING_SERVICE_STARTED]: {
    channels: "sms",
    emailTemplate: "—",
    smsBuilder: "buildBookingServiceStartedSMS",
    trigger: "startNonWalkService (dashboard/provider/actions) when implemented; optional for non-walk",
    cronNote: "Optional: fire when provider marks service started for non-walk services.",
  },
  [NotificationTrigger.WALK_TRACKING_STARTED]: {
    channels: "sms",
    emailTemplate: "—",
    smsBuilder: "buildWalkTrackingStartedSMS",
    trigger: "startWalk (dashboard/provider/actions)",
  },
  [NotificationTrigger.BOOKING_COMPLETED]: {
    channels: "email",
    emailTemplate: "booking-completed.tsx",
    trigger: "sendBookingCompletedNotifications (notifications/booking-notifications) from endWalk / completeNonWalkBooking",
  },
  [NotificationTrigger.REVIEW_PROMPT_24H]: {
    channels: "email",
    emailTemplate: "review-prompt.tsx",
    trigger: "runReviewPromptCron (notifications/cron-scheduled-tasks)",
    cronNote: "Schedule hourly; ~24h after booking completed without review.",
  },
  [NotificationTrigger.REVIEW_RECEIVED]: {
    channels: "email",
    emailTemplate: "review-received.tsx",
    trigger: "createReview (dashboard/owner/actions)",
  },
  [NotificationTrigger.PAYMENT_RECEIPT]: {
    channels: "email",
    emailTemplate: "payment-receipt.tsx",
    trigger: "acceptBooking (same capture flow)",
  },
  [NotificationTrigger.PAYOUT_PROCESSED]: {
    channels: "email",
    emailTemplate: "payout-processed.tsx",
    trigger: "Stripe webhook transfer.created",
  },
  [NotificationTrigger.OWNER_CANCELLED]: {
    channels: "both",
    emailTemplate: "owner-cancelled.tsx",
    smsBuilder: "buildOwnerCancelledProviderSMS",
    trigger: "cancelBooking (dashboard/owner/actions)",
  },
  [NotificationTrigger.PROVIDER_CANCELLED]: {
    channels: "both",
    emailTemplate: "provider-cancelled.tsx",
    smsBuilder: "buildProviderCancelledOwnerSMS",
    trigger: "cancelAcceptedBookingAsProvider (dashboard/provider/actions)",
  },
  [NotificationTrigger.ADOPTION_APPLICATION_RECEIVED]: {
    channels: "email",
    emailTemplate: "adoption-application-received.tsx",
    trigger: "submitAdoptionApplication (adopt/apply/actions)",
  },
  [NotificationTrigger.ADOPTION_STATUS_UPDATE]: {
    channels: "email",
    emailTemplate: "adoption-status-update.tsx",
    trigger: "approveApplication / declineApplication (dashboard/rescue/actions), advancePlacementStatus (admin/adoptions/actions)",
  },
  [NotificationTrigger.ADOPTION_PLACEMENT_MILESTONE]: {
    channels: "email",
    emailTemplate: "adoption-milestone.tsx",
    trigger: "advancePlacementStatus (admin/adoptions/actions) for vet_complete, transport_booked, in_transit, delivered",
  },
  [NotificationTrigger.POST_ADOPTION_1W]: {
    channels: "email",
    emailTemplate: "post-adoption-checkin.tsx",
    trigger: "runPostAdoptionReminderCron (notifications/cron-scheduled-tasks)",
    cronNote: "Weekly/daily job; uses postAdoptionReminderKeys for idempotency.",
  },
  [NotificationTrigger.POST_ADOPTION_1M]: {
    channels: "email",
    emailTemplate: "post-adoption-checkin.tsx",
    trigger: "runPostAdoptionReminderCron",
    cronNote: "Same cron with phase 1m.",
  },
  [NotificationTrigger.POST_ADOPTION_3M]: {
    channels: "email",
    emailTemplate: "post-adoption-checkin.tsx",
    trigger: "runPostAdoptionReminderCron",
    cronNote: "Same cron with phase 3m.",
  },
  [NotificationTrigger.SIGNUP_DONATION_THANK_YOU]: {
    channels: "email",
    emailTemplate: "signup-donation-thank-you.tsx",
    trigger: "Stripe webhook payment_intent.succeeded (signup_donation)",
  },
  [NotificationTrigger.GUARDIAN_WELCOME]: {
    channels: "email",
    emailTemplate: "guardian-welcome.tsx",
    trigger: "Stripe webhook checkout.session.completed (Guardian) via notifyGuardianSubscriptionStarted",
  },
  [NotificationTrigger.GUARDIAN_MONTHLY_CHARGE]: {
    channels: "email",
    emailTemplate: "guardian-monthly-charge.tsx",
    trigger: "Stripe webhook invoice.paid via notifyGuardianInvoicePaid",
  },
  [NotificationTrigger.GUARDIAN_PAUSED]: {
    channels: "email",
    emailTemplate: "guardian-paused.tsx",
    trigger: "syncGuardianSubscriptionFromStripe (paused)",
  },
  [NotificationTrigger.GUARDIAN_CANCELLED]: {
    channels: "email",
    emailTemplate: "guardian-cancelled.tsx",
    trigger: "syncGuardianSubscriptionFromStripe / subscription.deleted (cancelled)",
  },
  [NotificationTrigger.MONTHLY_GIVING_RECEIPT]: {
    channels: "email",
    emailTemplate: "monthly-giving-receipt.tsx",
    trigger: "runMonthlyGivingReceiptCron (notifications/cron-scheduled-tasks)",
    cronNote: "1st of month; aggregates prior month donations per user.",
  },
  [NotificationTrigger.GUARANTEE_CLAIM_FILED]: {
    channels: "email",
    emailTemplate: "claim-reported.tsx",
    trigger: "reportProblem (lib/disputes/actions)",
  },
  [NotificationTrigger.DISPUTE_OPENED]: {
    channels: "email",
    emailTemplate: "dispute-reported.tsx",
    trigger: "reportProblem (lib/disputes/actions)",
  },
  [NotificationTrigger.CASE_RESOLVED]: {
    channels: "email",
    emailTemplate: "case-resolved.tsx",
    trigger: "adminResolveDispute / adminResolveClaim (lib/disputes/actions)",
  },
  [NotificationTrigger.NEW_MESSAGE]: {
    channels: "both",
    emailTemplate: "new-message-notification.tsx",
    smsBuilder: "buildNewMessageSMS",
    trigger: "sendMessage (dashboard/messages/actions); first in conversation per 24h",
  },
  [NotificationTrigger.CHARITY_PAYOUT]: {
    channels: "email",
    emailTemplate: "charity-payout-notification.tsx",
    trigger: "sendCharityPayoutNotificationToContact (lib/giving/actions) — call when fund payout is recorded",
    cronNote: "Wire from admin/fund payout flow when implemented.",
  },
};
