"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);

  const showDistrict = CYPRUS_ROLES.includes(role);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in name, email, and password.");
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
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-20 sm:px-6">
        <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="text-center">
            <h1 className="text-2xl font-normal tracking-tight text-[#1B2432] sm:text-3xl" style={{ fontFamily: "var(--tiny-font-display), serif" }}>
              Create an account
            </h1>
            <p className="mt-2 text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
              No matter the size. Join Tinies.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 block w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Phone <span className="text-[#6B7280]">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 block w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                placeholder="+357..."
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                I am a
              </span>
              <div className="mt-2 space-y-2">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 has-[:checked]:border-[#0A6E5C] has-[:checked]:bg-[#0A6E5C]/5"
                    style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={(e) => setRole(e.target.value)}
                      className="h-4 w-4 border-[#0A6E5C]/30 text-[#0A6E5C] focus:ring-[#0A6E5C]"
                    />
                    <span className="text-sm font-medium text-[#1B2432]">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {showDistrict && (
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  District
                </label>
                <select
                  id="district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="mt-1.5 block w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                  style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[999px] h-12 bg-[#0A6E5C] px-4 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#0A6E5C] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
