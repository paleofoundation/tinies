import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export default function MessagesLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <PageLoadingSkeleton bars={5} />
    </div>
  );
}
