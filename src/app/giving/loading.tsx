import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function GivingLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <PageLoadingSkeleton bars={6} />
    </div>
  );
}
