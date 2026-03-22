"use client";

import { createContext, useContext } from "react";

export type FeedbackUIContextValue = { openFeedback: () => void };

export const FeedbackUIContext = createContext<FeedbackUIContextValue | null>(null);

export function useFeedbackUI(): FeedbackUIContextValue {
  const ctx = useContext(FeedbackUIContext);
  if (!ctx) {
    throw new Error("useFeedbackUI must be used within FeedbackShell");
  }
  return ctx;
}
