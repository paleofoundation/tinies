import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <PageLoadingSkeleton bars={8} />
    </div>
  );
}
