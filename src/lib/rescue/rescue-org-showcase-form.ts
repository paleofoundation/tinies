import { Prisma } from "@prisma/client";
import {
  DESCRIPTION_MAX,
  parseContactPhone,
  parseDistrict,
  parseFacilityPhotoUrlsFromLines,
  parseFacilityPhotosJson,
  parseFoundedYear,
  parseOptionalPositiveInt,
  parsePublicContactEmail,
  parseTeamMembersJson,
} from "@/lib/validations/rescue-org-showcase";

export type RescueOrgShowcaseExtract =
  | { ok: false; error: string }
  | {
      ok: true;
      data: {
        description: string | null;
        foundedYear: number | null;
        teamMembers: Prisma.InputJsonValue;
        facilityPhotos: string[];
        facilityVideoUrl: string | null;
        operatingHours: string | null;
        volunteerInfo: string | null;
        donationNeeds: string | null;
        totalAnimalsRescued: number | null;
        totalAnimalsAdopted: number | null;
        contactPhone: string | null;
        contactEmail: string | null;
        district: string | null;
        coverPhotoUrl: string | null;
      };
    };

/**
 * @param facilitySource — `json` when `facilityPhotosJson` hidden field is present (edit + dashboard); `lines` for create form textarea.
 */
export function extractRescueOrgShowcaseFromForm(
  formData: FormData,
  facilitySource: "json" | "lines"
): RescueOrgShowcaseExtract {
  const descriptionRaw = (formData.get("description") as string)?.trim() ?? "";
  const description = descriptionRaw.length > 0 ? descriptionRaw : null;
  if (description && description.length > DESCRIPTION_MAX) {
    return { ok: false, error: `About text must be ${DESCRIPTION_MAX} characters or less.` };
  }

  const teamParsed = parseTeamMembersJson(formData.get("teamMembersJson") as string | null);
  if (teamParsed === "invalid") {
    return { ok: false, error: "Invalid team members. Check names and roles." };
  }

  let facilityPhotos: string[];
  if (facilitySource === "json") {
    const fp = parseFacilityPhotosJson(formData.get("facilityPhotosJson") as string | null);
    if (fp === "invalid") {
      return { ok: false, error: "Invalid facility photos (max 10 valid URLs)." };
    }
    facilityPhotos = fp;
  } else {
    const fp = parseFacilityPhotoUrlsFromLines(formData.get("facilityPhotosLines") as string | null);
    if (fp === "invalid") {
      return { ok: false, error: "Invalid facility photo URLs (one per line, max 10)." };
    }
    facilityPhotos = fp;
  }

  const fy = parseFoundedYear(formData.get("foundedYear") as string | null);
  if (fy === "invalid") return { ok: false, error: "Founded year must be between 1800 and 2100." };

  const tr = parseOptionalPositiveInt(formData.get("totalAnimalsRescued") as string | null);
  if (tr === "invalid") return { ok: false, error: "Total animals rescued must be a valid number." };
  const ta = parseOptionalPositiveInt(formData.get("totalAnimalsAdopted") as string | null);
  if (ta === "invalid") return { ok: false, error: "Total animals adopted must be a valid number." };

  const pubEmail = parsePublicContactEmail(formData.get("publicContactEmail") as string | null);
  if (pubEmail === "invalid") return { ok: false, error: "Public contact email is invalid." };

  const dist = parseDistrict(formData.get("district") as string | null);
  if (dist === "invalid") return { ok: false, error: "District must be a valid Cyprus district." };

  const facilityVideoRaw = (formData.get("facilityVideoUrl") as string)?.trim() ?? "";
  const facilityVideoUrl = facilityVideoRaw.length > 0 ? facilityVideoRaw : null;

  const operatingHoursRaw = (formData.get("operatingHours") as string)?.trim() ?? "";
  const operatingHours = operatingHoursRaw.length > 0 ? operatingHoursRaw : null;
  const volunteerInfoRaw = (formData.get("volunteerInfo") as string)?.trim() ?? "";
  const volunteerInfo = volunteerInfoRaw.length > 0 ? volunteerInfoRaw : null;
  const donationNeedsRaw = (formData.get("donationNeeds") as string)?.trim() ?? "";
  const donationNeeds = donationNeedsRaw.length > 0 ? donationNeedsRaw : null;

  const coverRaw = (formData.get("coverPhotoUrl") as string)?.trim() || "";
  const coverPhotoUrl = coverRaw.length > 0 ? coverRaw : null;

  return {
    ok: true,
    data: {
      description,
      foundedYear: fy,
      teamMembers: teamParsed.length > 0 ? teamParsed : [],
      facilityPhotos,
      facilityVideoUrl,
      operatingHours,
      volunteerInfo,
      donationNeeds,
      totalAnimalsRescued: tr,
      totalAnimalsAdopted: ta,
      contactPhone: parseContactPhone(formData.get("contactPhone") as string | null),
      contactEmail: pubEmail,
      district: dist,
      coverPhotoUrl,
    },
  };
}
