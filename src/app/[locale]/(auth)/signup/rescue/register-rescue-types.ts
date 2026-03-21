export type RegisterRescueResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
