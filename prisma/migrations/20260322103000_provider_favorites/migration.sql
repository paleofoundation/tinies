-- CreateTable
CREATE TABLE "provider_favorites" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_favorites_owner_id_provider_id_key" ON "provider_favorites"("owner_id", "provider_id");

-- CreateIndex
CREATE INDEX "provider_favorites_owner_id_idx" ON "provider_favorites"("owner_id");

-- CreateIndex
CREATE INDEX "provider_favorites_provider_id_idx" ON "provider_favorites"("provider_id");

-- AddForeignKey
ALTER TABLE "provider_favorites" ADD CONSTRAINT "provider_favorites_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_favorites" ADD CONSTRAINT "provider_favorites_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
