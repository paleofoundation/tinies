-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "badge_label" TEXT NOT NULL,
    "badge_color" TEXT,
    "estimated_minutes" INTEGER NOT NULL,
    "total_slides" INTEGER NOT NULL,
    "passing_score" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_slides" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "slide_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "slide_type" TEXT NOT NULL,
    "quiz_question" TEXT,
    "quiz_options" JSONB,
    "quiz_explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_certifications" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "certificate_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_active_idx" ON "courses"("active");

-- CreateIndex
CREATE INDEX "courses_required_idx" ON "courses"("required");

-- CreateIndex
CREATE INDEX "course_slides_course_id_idx" ON "course_slides"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_slides_course_id_slide_number_key" ON "course_slides"("course_id", "slide_number");

-- CreateIndex
CREATE UNIQUE INDEX "provider_certifications_certificate_id_key" ON "provider_certifications"("certificate_id");

-- CreateIndex
CREATE INDEX "provider_certifications_provider_id_idx" ON "provider_certifications"("provider_id");

-- CreateIndex
CREATE INDEX "provider_certifications_course_id_idx" ON "provider_certifications"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_certifications_provider_id_course_id_key" ON "provider_certifications"("provider_id", "course_id");

-- AddForeignKey
ALTER TABLE "course_slides" ADD CONSTRAINT "course_slides_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_certifications" ADD CONSTRAINT "provider_certifications_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_certifications" ADD CONSTRAINT "provider_certifications_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
