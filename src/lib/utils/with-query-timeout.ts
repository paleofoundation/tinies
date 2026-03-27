const DEFAULT_MS = 5000;

/**
 * Race `promise` against a timeout. On timeout or rejection, logs and returns `fallback`.
 * Does not cancel the underlying work (e.g. Prisma); avoids hanging the HTTP response.
 */
export async function withQueryTimeout<T>(
  promise: Promise<T>,
  fallback: T,
  label: string,
  ms: number = DEFAULT_MS
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<"__timeout__">((resolve) => {
    timeoutId = setTimeout(() => resolve("__timeout__"), ms);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (result === "__timeout__") {
      console.error(`[withQueryTimeout] ${label}: timed out after ${ms}ms`);
      return fallback;
    }
    return result;
  } catch (e) {
    console.error(`[withQueryTimeout] ${label}:`, e);
    return fallback;
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}
