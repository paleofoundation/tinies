/** Serializable site image row for the admin UI (client). */
export type SiteImageAdminRowSerializable = {
  id: string;
  imageKey: string;
  category: string;
  label: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  updatedAt: string;
};

export const SITE_IMAGE_ADMIN_CATEGORIES = [
  "All",
  "branding",
  "blog",
  "provider",
  "rescue",
  "adoption",
  "page",
] as const;

export type SiteImageAdminCategoryTab = (typeof SITE_IMAGE_ADMIN_CATEGORIES)[number];
