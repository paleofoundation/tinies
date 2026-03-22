"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { MessageSquarePlus, X } from "lucide-react";
import { toast } from "sonner";
import { submitFeedback } from "@/lib/feedback/actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail: string;
};

export function FeedbackWidget({ open, onOpenChange, defaultEmail }: Props) {
  const t = useTranslations("feedback");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [pageUrl, setPageUrl] = useState("");
  const [userAgent, setUserAgent] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPageUrl(window.location.href);
    setUserAgent(navigator.userAgent);
  }, []);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    setPageUrl(window.location.href);
    setUserAgent(navigator.userAgent);
  }, [open]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      const fd = new FormData(form);
      if (typeof window !== "undefined") {
        if (!String(fd.get("pageUrl") ?? "").trim()) {
          fd.set("pageUrl", window.location.href);
        }
        if (!String(fd.get("userAgent") ?? "").trim()) {
          fd.set("userAgent", navigator.userAgent);
        }
      }
      const result = await submitFeedback(fd);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t("success"));
      form.reset();
      if (defaultEmail) {
        const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
        if (emailInput) emailInput.value = defaultEmail;
      }
      onOpenChange(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="fixed bottom-5 right-5 z-[55] flex h-12 w-12 items-center justify-center rounded-full shadow-md transition hover:opacity-95 hover:shadow-lg"
        style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
        aria-label={t("fabLabel")}
      >
        <MessageSquarePlus className="h-6 w-6" aria-hidden />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[56] flex flex-col justify-end bg-black/40"
          role="presentation"
          onClick={() => !pending && onOpenChange(false)}
          onKeyDown={(ev) => {
            if (ev.key === "Escape" && !pending) onOpenChange(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-panel-title"
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border-t p-5 shadow-xl sm:p-6"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              fontFamily: "var(--font-body), sans-serif",
            }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="mx-auto max-w-lg pb-8">
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2
                  id="feedback-panel-title"
                  className="text-lg font-normal"
                  style={{ fontFamily: "var(--font-heading), serif", color: "var(--color-text)" }}
                >
                  {t("panelTitle")}
                </h2>
                <button
                  type="button"
                  onClick={() => !pending && onOpenChange(false)}
                  className="rounded-lg p-2 hover:bg-[var(--color-neutral-100)]"
                  aria-label={t("closePanel")}
                >
                  <X className="h-5 w-5" style={{ color: "var(--color-text-secondary)" }} aria-hidden />
                </button>
              </div>

              <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
                <input type="hidden" name="pageUrl" value={pageUrl} />
                <input type="hidden" name="userAgent" value={userAgent} />

                <div>
                  <label htmlFor="feedback-type" className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {t("typeLabel")}
                  </label>
                  <select
                    id="feedback-type"
                    name="type"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-200)]"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    defaultValue="general"
                  >
                    <option value="bug">{t("typeBug")}</option>
                    <option value="feature">{t("typeFeature")}</option>
                    <option value="general">{t("typeGeneral")}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="feedback-description" className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {t("descriptionLabel")}
                  </label>
                  <textarea
                    id="feedback-description"
                    name="description"
                    required
                    minLength={20}
                    rows={5}
                    className="w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-200)]"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    placeholder={t("descriptionPlaceholder")}
                  />
                </div>

                <div>
                  <label htmlFor="feedback-email" className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {t("emailLabel")}
                  </label>
                  <input
                    id="feedback-email"
                    name="email"
                    type="email"
                    defaultValue={defaultEmail}
                    autoComplete="email"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-200)]"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                <div>
                  <label htmlFor="feedback-screenshot" className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {t("screenshotLabel")}
                  </label>
                  <input
                    id="feedback-screenshot"
                    name="screenshot"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--color-primary-50)] file:px-3 file:py-2 file:text-sm file:font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                  />
                </div>

                {pageUrl ? (
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {t("pageUrlLabel")}:{" "}
                    <span className="break-all" style={{ color: "var(--color-text-secondary)" }}>
                      {pageUrl}
                    </span>
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="mt-1 inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {pending ? t("submitting") : t("submit")}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
