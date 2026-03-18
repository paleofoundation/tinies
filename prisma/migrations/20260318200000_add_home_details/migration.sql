-- AlterTable
ALTER TABLE "provider_profiles" ADD COLUMN     "home_type" TEXT,
ADD COLUMN     "has_yard" BOOLEAN,
ADD COLUMN     "yard_fenced" BOOLEAN,
ADD COLUMN     "smoking_home" BOOLEAN,
ADD COLUMN     "pets_in_home" TEXT,
ADD COLUMN     "children_in_home" TEXT,
ADD COLUMN     "dogs_on_furniture" BOOLEAN,
ADD COLUMN     "potty_break_frequency" TEXT,
ADD COLUMN     "typical_day" TEXT,
ADD COLUMN     "info_wanted_about_pet" TEXT;
