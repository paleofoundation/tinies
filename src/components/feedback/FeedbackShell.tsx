"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { BetaBanner } from "@/components/feedback/BetaBanner";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { FeedbackUIContext } from "@/components/feedback/feedback-ui-context";

export function FeedbackShell({
  showBetaUI,
  defaultEmail,
  children,
}: {
  showBetaUI: boolean;
  defaultEmail: string | null;
  children: ReactNode;
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const openFeedback = useCallback(() => setPanelOpen(true), []);
  const value = useMemo(() => ({ openFeedback }), [openFeedback]);

  return (
    <FeedbackUIContext.Provider value={value}>
      {showBetaUI ? <BetaBanner /> : null}
      {children}
      {showBetaUI ? (
        <FeedbackWidget open={panelOpen} onOpenChange={setPanelOpen} defaultEmail={defaultEmail ?? ""} />
      ) : null}
    </FeedbackUIContext.Provider>
  );
}
