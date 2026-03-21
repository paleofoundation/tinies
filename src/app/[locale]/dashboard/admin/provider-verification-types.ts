export type ProviderVerificationRow = {
  id: string;
  userId: string;
  slug: string;
  bio: string | null;
  idDocumentUrl: string | null;
  stripeVerificationSessionId: string | null;
  verified: boolean;
  verifiedAt: Date | null;
  user: { name: string; email: string };
};
