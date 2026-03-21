/** Serializable booking update for owner feed / polling. */
export type BookingUpdateFeedItem = {
  id: string;
  createdAt: string;
  text: string | null;
  photos: string[];
  videoUrl: string | null;
  providerName: string;
  providerAvatarUrl: string | null;
};
