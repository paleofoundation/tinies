import Link from "next/link";
import { getTransportProviders } from "../adoptions/actions";
import { TransportProviderTable } from "./TransportProviderTable";

export default async function AdminTransportPage() {
  const { providers } = await getTransportProviders();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-8 sm:px-6" style={{ maxWidth: "var(--max-width)" }}>
        <div>
          <Link
            href="/dashboard/admin"
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            ← Back to Admin
          </Link>
          <h1 className="mt-2 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Transport providers
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Manage transport providers for adoption logistics.
          </p>
        </div>

        <div className="mt-8">
          <TransportProviderTable providers={providers} />
        </div>
      </main>
    </div>
  );
}
