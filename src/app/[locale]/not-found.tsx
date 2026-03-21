import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      <div className="text-center max-w-md">
        <p
          className="text-xl font-normal"
          style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-primary)" }}
        >
          Tinies
        </p>
        <h1
          className="mt-4 text-3xl font-normal"
          style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
        >
          Page not found
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            Home
          </Link>
          <Link
            href="/services/search"
            className="font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            Find pet care
          </Link>
          <Link
            href="/adopt"
            className="font-semibold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            Adopt
          </Link>
        </nav>
        <Link
          href="/"
          className="mt-8 inline-block rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-6 py-3 font-semibold text-white hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
