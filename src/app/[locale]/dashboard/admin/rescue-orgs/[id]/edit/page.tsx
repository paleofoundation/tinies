import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRescueOrgById } from "../../../rescue-org-actions";
import { RescueOrgForm } from "../../RescueOrgForm";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const org = await getRescueOrgById(id);
  return {
    title: org ? `Edit ${org.name} (Admin)` : "Edit rescue org (Admin)",
  };
}

export default async function EditRescueOrgPage({ params }: Props) {
  const { id } = await params;
  const org = await getRescueOrgById(id);
  if (!org) notFound();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-12 sm:px-6 sm:py-16" style={{ maxWidth: "var(--max-width)" }}>
        <Link
          href="/dashboard/admin"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
        >
          ← Admin dashboard
        </Link>
        <h1
          className="mt-6 font-normal"
          style={{
            fontFamily: "var(--font-heading), serif",
            fontSize: "var(--text-2xl)",
            color: "var(--color-text)",
          }}
        >
          Edit rescue organisation
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>
          {org.name} · <span style={{ color: "var(--color-text-muted)" }}>{org.slug}</span>
        </p>
        <RescueOrgForm
          mode="edit"
          orgId={org.id}
          initial={{
            name: org.name,
            mission: org.mission,
            location: org.location,
            charityRegistration: org.charityRegistration,
            website: org.website,
            logoUrl: org.logoUrl,
            bankIban: org.bankIban,
            socialLinks: org.socialLinks,
            verified: org.verified,
            accountEmail: org.accountEmail,
            description: org.description,
            foundedYear: org.foundedYear,
            teamMembers: org.teamMembers,
            facilityPhotos: org.facilityPhotos,
            facilityVideoUrl: org.facilityVideoUrl,
            operatingHours: org.operatingHours,
            volunteerInfo: org.volunteerInfo,
            donationNeeds: org.donationNeeds,
            totalAnimalsRescued: org.totalAnimalsRescued,
            totalAnimalsAdopted: org.totalAnimalsAdopted,
            contactPhone: org.contactPhone,
            publicContactEmail: org.publicContactEmail,
            district: org.district,
            coverPhotoUrl: org.coverPhotoUrl,
          }}
        />
      </main>
    </div>
  );
}
