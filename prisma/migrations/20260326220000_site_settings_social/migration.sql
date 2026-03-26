-- Site-wide settings (singleton) for footer social links
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "social_linkedin_url" TEXT,
    "social_facebook_url" TEXT,
    "social_x_url" TEXT,
    "social_instagram_url" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
