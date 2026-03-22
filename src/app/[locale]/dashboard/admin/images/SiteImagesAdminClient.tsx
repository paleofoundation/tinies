"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminListSiteImages,
  adminUploadSiteImage,
  adminUpdateSiteImageMeta,
} from "@/lib/images/site-image-actions";
import type {
  SiteImageAdminCategoryTab,
  SiteImageAdminRowSerializable,
} from "@/lib/images/site-image-admin-types";
import { SITE_IMAGE_ADMIN_CATEGORIES } from "@/lib/images/site-image-admin-types";

type Props = {
  initialRows: SiteImageAdminRowSerializable[];
};

const ACCEPT = "image/jpeg,image/png,image/webp";

function formatUpdated(iso: string): string {
  const d = Date.parse(iso);
  if (Number.isNaN(d)) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(d));
}

export function SiteImagesAdminClient({ initialRows }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [tab, setTab] = useState<SiteImageAdminCategoryTab>("All");
  const [modalKey, setModalKey] = useState<string | null>(null);
  const [draftAlt, setDraftAlt] = useState("");
  const [pickedMime, setPickedMime] = useState<string | null>(null);
  const [pickedBase64, setPickedBase64] = useState<string | null>(null);
  const [pickedPreviewUrl, setPickedPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selected = useMemo(
    () => (modalKey ? rows.find((r) => r.imageKey === modalKey) ?? null : null),
    [modalKey, rows]
  );

  const filtered = useMemo(() => {
    if (tab === "All") return rows;
    return rows.filter((r) => r.category === tab);
  }, [rows, tab]);

  const openModal = useCallback((row: SiteImageAdminRowSerializable) => {
    setPickedPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setModalKey(row.imageKey);
    setDraftAlt(row.alt);
    setPickedMime(null);
    setPickedBase64(null);
  }, []);

  const closeModal = useCallback(() => {
    setPickedPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setModalKey(null);
    setDraftAlt("");
    setPickedMime(null);
    setPickedBase64(null);
  }, []);

  const onPickFile = useCallback((file: File | null) => {
    setPickedPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (!file) {
      setPickedMime(null);
      setPickedBase64(null);
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      toast.error("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const comma = dataUrl.indexOf(",");
      const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
      setPickedBase64(b64);
      setPickedMime(file.type);
      setPickedPreviewUrl(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  }, []);

  const refreshRows = useCallback(async () => {
    const next = await adminListSiteImages();
    if ("error" in next) {
      toast.error(next.error);
      return;
    }
    setRows(
      next.map((r) => ({
        ...r,
        updatedAt: r.updatedAt.toISOString(),
      }))
    );
  }, []);

  const onSave = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    try {
      if (pickedBase64 && pickedMime) {
        const res = await adminUploadSiteImage({
          imageKey: selected.imageKey,
          category: selected.category,
          base64: pickedBase64,
          mimeType: pickedMime,
          alt: draftAlt,
        });
        if ("error" in res) {
          toast.error(res.error);
          return;
        }
        toast.success("Image updated.");
      } else if (draftAlt.trim() !== (selected.alt ?? "").trim()) {
        const res = await adminUpdateSiteImageMeta({
          imageKey: selected.imageKey,
          alt: draftAlt,
        });
        if ("error" in res) {
          toast.error(res.error);
          return;
        }
        toast.success("Alt text saved.");
      } else {
        toast.message("No changes to save.");
        return;
      }
      await refreshRows();
      closeModal();
    } catch (e) {
      console.error("SiteImagesAdminClient onSave", e);
      const message =
        e instanceof Error
          ? e.message
          : "Save failed. If you uploaded a large file, try a smaller image or ask your developer to raise the server action size limit.";
      toast.error(
        /body.*limit|413|too large/i.test(message)
          ? "File is too large for the server to accept. Try an image under ~2MB or compress it, then try again."
          : message
      );
    } finally {
      setSaving(false);
    }
  }, [selected, pickedBase64, pickedMime, draftAlt, refreshRows, closeModal]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto px-4 py-12 sm:px-6 lg:px-8" style={{ maxWidth: "var(--max-width)" }}>
        <h1
          className="font-normal sm:text-3xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)" }}
        >
          Site images
        </h1>
        <p className="mt-1 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
          Replace images used across the site. Uploads go to the Supabase <code className="text-xs">site-images</code> bucket.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {SITE_IMAGE_ADMIN_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setTab(c)}
              className="rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: tab === c ? "var(--color-primary-50)" : "var(--color-surface)",
                color: tab === c ? "var(--color-primary)" : "var(--color-text)",
              }}
            >
              {c === "All" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((row) => (
            <li key={row.id} className="w-full min-w-0" style={{ maxWidth: "220px" }}>
              <button
                type="button"
                onClick={() => openModal(row)}
                className="flex w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  className="relative aspect-[4/3] w-full bg-[var(--color-background)]"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  {row.url?.trim() ? (
                    <Image
                      src={row.url.trim()}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="220px"
                      unoptimized={row.url.includes("supabase")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ color: "var(--color-text-muted)" }}>
                      <ImageIcon className="h-10 w-10" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <span className="line-clamp-2 text-sm font-medium leading-snug">{row.label}</span>
                  <code className="truncate text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                    {row.imageKey}
                  </code>
                  <span
                    className="mt-1 w-fit rounded-[var(--radius-pill)] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                  >
                    {row.category}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Updated {formatUpdated(row.updatedAt)}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </main>

      {selected ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(28, 28, 28, 0.45)" }}
          role="presentation"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal
            aria-labelledby="site-image-edit-title"
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-xl)] border p-6 shadow-lg"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full p-1 hover:opacity-70"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2
              id="site-image-edit-title"
              className="pr-10 text-lg font-normal"
              style={{ fontFamily: "var(--font-heading), serif" }}
            >
              {selected.label}
            </h2>
            <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
              <code>{selected.imageKey}</code>
            </p>

            <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-border)" }}>
              {pickedPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob preview
                <img src={pickedPreviewUrl} alt="New preview" className="h-full w-full object-contain" />
              ) : selected.url?.trim() ? (
                <Image
                  src={selected.url.trim()}
                  alt={draftAlt || selected.label}
                  fill
                  className="object-contain"
                  sizes="(max-width: 512px) 100vw, 512px"
                  unoptimized={selected.url.includes("supabase")}
                />
              ) : (
                <div className="flex h-full min-h-[160px] items-center justify-center" style={{ color: "var(--color-text-muted)" }}>
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Upload new image
              </label>
              <input
                type="file"
                accept={ACCEPT}
                className="mt-2 block w-full text-sm"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
              <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                JPEG, PNG, or WebP · max 5MB
              </p>
            </div>

            <div className="mt-4">
              <label htmlFor="site-img-alt" className="block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Alt text
              </label>
              <textarea
                id="site-img-alt"
                rows={2}
                value={draftAlt}
                onChange={(e) => setDraftAlt(e.target.value)}
                className="mt-2 w-full rounded-[var(--radius-lg)] border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border)", fontFamily: "var(--font-body), sans-serif" }}
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
