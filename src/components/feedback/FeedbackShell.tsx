"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { BetaBanner } from "@/components/feedback/BetaBanner";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { FeedbackUIContext } from "@/components/feedback/feedback-ui-context";

export function FeedbackShell({
  showBetaUI,
  showBetaBanner = true,
  defaultEmail,
  children,
}: {
  showBetaUI: boolean;
  /** When false, hide the top strip but keep the feedback FAB (if showBetaUI). */
  showBetaBanner?: boolean;
  defaultEmail: string | null;
  children: ReactNode;
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const openFeedback = useCallback(() => setPanelOpen(true), []);
  const value = useMemo(() => ({ openFeedback }), [openFeedback]);

  return (
    <FeedbackUIContext.Provider value={value}>
      {showBetaUI && showBetaBanner ? <BetaBanner /> : null}
      {children}
      {showBetaUI ? (
        <FeedbackWidget open={panelOpen} onOpenChange={setPanelOpen} defaultEmail={defaultEmail ?? ""} />
      ) : null}
    </FeedbackUIContext.Provider>
  );
}
