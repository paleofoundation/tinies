"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function RequiredMark() {
  return (
    <span style={{ color: "var(--color-error)" }} aria-hidden>
      {" "}
      *
    </span>
  );
}

const ROLES = [
  { value: "owner", label: "Pet Owner" },
  { value: "provider", label: "Service Provider" },
  { value: "rescue", label: "Rescue Organization" },
  { value: "adopter", label: "International Adopter" },
] as const;

const DISTRICTS = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta"] as const;

const CYPRUS_ROLES = ["owner", "provider", "rescue"];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>("owner");
  const [district, setDistrict] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const showDistrict = CYPRUS_ROLES.includes(role);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in name, email, and password.");
      return;
    }
    if (showDistrict && !district.trim()) {
      toast.error("Please select your district.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          phone: phone.trim() || undefined,
          role,
          ...(showDistrict && district ? { district } : {}),
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your email to confirm your account.");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-20 sm:px-6">
        <div className="rounded-[var(--radius-lg)] border p-8 sm:p-10" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          <div className="text-center">
            <h1 className="font-normal tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}>
              Create an account
            </h1>
            <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              No matter the size. Join Tinies.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Name
                <RequiredMark />
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Email
                <RequiredMark />
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Password
                <RequiredMark />
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-[var(--radius-lg)] border py-2.5 pl-4 pr-12 focus:outline-none focus:ring-2"
                  style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md transition-opacity hover:opacity-80"
                  style={{ color: "var(--color-text-secondary)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} aria-hidden /> : <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Phone <span style={{ color: "var(--color-text-secondary)" }}>(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                placeholder="+357..."
              />
            </div>

            <div>
              <span className="block text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                I am a
                <RequiredMark />
              </span>
              <div className="mt-2 space-y-2">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-2.5 has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary-50)]"
                    style={{ fontFamily: "var(--font-body), sans-serif", borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={(e) => setRole(e.target.value)}
                      className="h-4 w-4 focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {showDistrict && (
              <div>
                <label htmlFor="district" className="block text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                  District
                  <RequiredMark />
                </label>
                <select
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                  style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-center text-xs leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-muted)" }}>
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline hover:opacity-90" style={{ color: "var(--color-primary)" }}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:opacity-90" style={{ color: "var(--color-primary)" }}>
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[var(--radius-pill)] h-12 px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
