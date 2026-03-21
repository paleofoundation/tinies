"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { rescueSelfRegistrationSchema } from "@/lib/validations/rescue-registration";
import { registerRescueOrganisation } from "./actions";
import { toast } from "sonner";

const WELCOME_REDIRECT = "/dashboard/rescue?welcome=1";

export default function RescueSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organisationName, setOrganisationName] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [location, setLocation] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [charityRegistrationNumber, setCharityRegistrationNumber] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      contactName,
      email,
      password,
      organisationName,
      missionStatement,
      location,
      websiteUrl,
      facebookUrl,
      instagramHandle,
      charityRegistrationNumber,
      logoUrl,
    };

    const parsed = rescueSelfRegistrationSchema.safeParse(payload);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? "Please check the form.");
      return;
    }

    setLoading(true);
    const result = await registerRescueOrganisation(parsed.data);
    if (!result.ok) {
      setLoading(false);
      toast.error(result.error);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email.trim(),
      password: parsed.data.password,
    });

    setLoading(false);

    if (signInError) {
      toast.success(
        "Your organisation is registered. Please sign in with the email and password you chose."
      );
      router.push("/login?next=/dashboard/rescue");
      router.refresh();
      return;
    }

    toast.success("Welcome to Tinies.");
    router.push(WELCOME_REDIRECT);
    router.refresh();
  }

  const missionLen = missionStatement.length;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <main
        className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-20"
        style={{ fontFamily: "var(--font-body), sans-serif" }}
      >
        <div
          className="rounded-[var(--radius-lg)] border p-8 sm:p-10"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="text-center">
            <h1
              className="font-normal tracking-tight sm:text-3xl"
              style={{
                fontFamily: "var(--font-heading), serif",
                fontSize: "var(--text-2xl)",
                color: "var(--color-text)",
              }}
            >
              Register your rescue
            </h1>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Join Tinies to list your animals, receive applications, and reach families in Cyprus and
              across Europe. There is no charge to list — you stay in charge of every adoption.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Contact person name <span style={{ color: "var(--color-secondary)" }}>*</span>
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                autoComplete="name"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  outlineColor: "var(--color-primary)",
                }}
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Email <span style={{ color: "var(--color-secondary)" }}>*</span>
              </label>
              <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                This will be your login email.
              </p>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  outlineColor: "var(--color-primary)",
                }}
                placeholder="you@yourrescue.org"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Password <span style={{ color: "var(--color-secondary)" }}>*</span>
              </label>
              <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                At least 8 characters.
              </p>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  outlineColor: "var(--color-primary)",
                }}
              />
            </div>

            <div>
              <label htmlFor="organisationName" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Organisation name <span style={{ color: "var(--color-secondary)" }}>*</span>
              </label>
              <input
                id="organisationName"
                name="organisationName"
                type="text"
                required
                value={organisationName}
                onChange={(e) => setOrganisationName(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  outlineColor: "var(--color-primary)",
                }}
                placeholder="e.g. Cyprus Stray Guardians"
              />
            </div>

            <div>
              <label htmlFor="missionStatement" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Mission statement
              </label>
              <textarea
                id="missionStatement"
                name="missionStatement"
                rows={4}
                maxLength={500}
                value={missionStatement}
                onChange={(e) => setMissionStatement(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  outlineColor: "var(--color-primary)",
                }}
                placeholder="What drives your rescue? Who do you help?"
              />
              <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                {missionLen} / 500 characters
              </p>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Location in Cyprus
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  outlineColor: "var(--color-primary)",
                }}
                placeholder="e.g. Parekklisia, Limassol"
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Website URL
              </label>
              <input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  outlineColor: "var(--color-primary)",
                }}
                placeholder="https://"
              />
            </div>

            <div>
              <label htmlFor="facebookUrl" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Facebook page URL
              </label>
              <input
                id="facebookUrl"
                name="facebookUrl"
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  outlineColor: "var(--color-primary)",
                }}
                placeholder="https://www.facebook.com/..."
              />
            </div>

            <div>
              <label htmlFor="instagramHandle" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Instagram handle
              </label>
              <input
                id="instagramHandle"
                name="instagramHandle"
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  outlineColor: "var(--color-primary)",
                }}
                placeholder="@yourrescue or full profile URL"
              />
            </div>

            <div>
              <label htmlFor="charityRegistrationNumber" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Charity registration number
              </label>
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                Optional — this helps us verify your organisation faster.
              </p>
              <input
                id="charityRegistrationNumber"
                name="charityRegistrationNumber"
                type="text"
                value={charityRegistrationNumber}
                onChange={(e) => setCharityRegistrationNumber(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  outlineColor: "var(--color-primary)",
                }}
              />
            </div>

            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Logo image URL
              </label>
              <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                Optional — paste a link to your logo image. You can add or change this later in your dashboard.
              </p>
              <input
                id="logoUrl"
                name="logoUrl"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  outlineColor: "var(--color-primary)",
                }}
                placeholder="https://"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-[var(--radius-pill)] font-semibold text-white transition-opacity disabled:opacity-60"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "var(--text-base)",
                backgroundColor: "var(--color-primary)",
              }}
            >
              {loading ? "Creating your account…" : "Create rescue account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Already registered?{" "}
            <Link href="/login?next=/dashboard/rescue" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-sm">
            <Link href="/for-rescues" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>
              ← Back to For rescues
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
