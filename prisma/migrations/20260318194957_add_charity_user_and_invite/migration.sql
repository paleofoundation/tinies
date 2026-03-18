-- AlterTable
ALTER TABLE "charities" ADD COLUMN "user_id" TEXT,
ADD COLUMN "invite_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "charities_user_id_key" ON "charities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "charities_invite_token_key" ON "charities"("invite_token");

-- AddForeignKey
ALTER TABLE "charities" ADD CONSTRAINT "charities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
