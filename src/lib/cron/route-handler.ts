import { NextRequest, NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/verify-request";

export type CronJobResult = { processed: number; errors: number };

export function createCronGetHandler(
  name: string,
  run: () => Promise<CronJobResult>
): (request: NextRequest) => Promise<NextResponse> {
  return async function GET(request: NextRequest) {
    if (!verifyCronRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      const { processed, errors } = await run();
      console.log(`[cron:${name}]`, { processed, errors });
      return NextResponse.json({ processed, errors });
    } catch (e) {
      console.error(`[cron:${name}] fatal`, e);
      return NextResponse.json(
        { processed: 0, errors: 1, error: "Cron job failed" },
        { status: 500 }
      );
    }
  };
}
