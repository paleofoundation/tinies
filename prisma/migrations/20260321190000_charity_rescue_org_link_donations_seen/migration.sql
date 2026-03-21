-- Optional link from charity to rescue org; last-seen for donations tab notifications.
ALTER TABLE "rescue_orgs" ADD COLUMN IF NOT EXISTS "donations_tab_last_seen_at" TIMESTAMP(3);

ALTER TABLE "charities" ADD COLUMN IF NOT EXISTS "rescue_org_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "charities_rescue_org_id_key" ON "charities"("rescue_org_id");
