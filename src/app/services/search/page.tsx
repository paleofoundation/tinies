import { getSearchProviders } from "./actions";
import { SearchContent } from "./SearchContent";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ServicesSearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const serviceType = typeof params.type === "string" ? params.type : "";
  const district = typeof params.district === "string" ? params.district : "";
  const priceMin = typeof params.priceMin === "string" ? params.priceMin : "";
  const priceMax = typeof params.priceMax === "string" ? params.priceMax : "";
  const minRatingParam = typeof params.minRating === "string" ? params.minRating : "";
  const minRating = minRatingParam ? parseInt(minRatingParam, 10) : null;
  const latParam = typeof params.lat === "string" ? params.lat : "";
  const lngParam = typeof params.lng === "string" ? params.lng : "";
  const lat = latParam ? parseFloat(latParam) : undefined;
  const lng = lngParam ? parseFloat(lngParam) : undefined;
  const sort = (typeof params.sort === "string" ? params.sort : "") || undefined;
  const cancellationPolicy = typeof params.cancellationPolicy === "string" ? params.cancellationPolicy : "";
  const homeType = typeof params.homeType === "string" ? params.homeType : "";
  const hasYardParam = typeof params.hasYard === "string" ? params.hasYard : "";
  const hasYard = hasYardParam === "true" ? true : undefined;

  const filters = {
    serviceType: serviceType || undefined,
    district: district || undefined,
    priceMin: priceMin ? parseFloat(priceMin) : undefined,
    priceMax: priceMax ? parseFloat(priceMax) : undefined,
    minRating: Number.isFinite(minRating) ? minRating! : undefined,
    cancellationPolicy: cancellationPolicy || undefined,
    homeType: homeType || undefined,
    hasYard,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    sort: sort as "distance" | "rating" | "price_low" | "price_high" | "review_count" | undefined,
  };

  const providers = await getSearchProviders(filters);

  return (
    <SearchContent
      initialProviders={providers}
      initialServiceType={serviceType}
      initialDistrict={district}
      initialPriceMin={priceMin}
      initialPriceMax={priceMax}
      initialMinRating={Number.isFinite(minRating) ? minRating : null}
      initialLat={Number.isFinite(lat) ? lat : null}
      initialLng={Number.isFinite(lng) ? lng : null}
      initialSort={sort || undefined}
      initialCancellationPolicy={cancellationPolicy || undefined}
      initialHomeType={homeType || undefined}
      initialHasYard={hasYard}
    />
  );
}
