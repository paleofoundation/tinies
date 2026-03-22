-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "email" TEXT,
    "page_url" TEXT NOT NULL,
    "user_agent" TEXT,
    "screenshot_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "feedback_status_idx" ON "feedback"("status");

-- CreateIndex
CREATE INDEX "feedback_type_idx" ON "feedback"("type");

-- CreateIndex
CREATE INDEX "feedback_created_at_idx" ON "feedback"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
