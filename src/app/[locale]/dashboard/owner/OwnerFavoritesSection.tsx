import { getOwnerFavoriteProviderCards } from "@/lib/providers/favorite-actions";
import { ProviderSearchListCard } from "@/components/providers/ProviderSearchListCard";

export async function OwnerFavoritesSection() {
  const cards = await getOwnerFavoriteProviderCards();
  if (cards.length === 0) return null;

  return (
    <section
      className="mt-12 rounded-[var(--radius-lg)] border p-6 sm:p-8"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
      aria-labelledby="owner-favorites-heading"
    >
      <h2
        id="owner-favorites-heading"
        className="font-normal sm:text-2xl"
        style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)", color: "var(--color-text)" }}
      >
        Favorite providers
      </h2>
      <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
        Providers you&apos;ve saved — book again in one tap.
      </p>
      <ul className="mt-8 space-y-6">
        {cards.map((provider) => (
          <ProviderSearchListCard
            key={provider.slug}
            provider={provider}
            primaryCta={{ href: `/services/book/${provider.slug}`, label: "Book again" }}
            secondaryCta={{ href: `/services/provider/${provider.slug}`, label: "View profile" }}
          />
        ))}
      </ul>
    </section>
  );
}
