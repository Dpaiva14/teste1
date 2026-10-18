import { NextResponse } from "next/server";
import { prisma } from "@/database/client";

export const dynamic = "force-dynamic";

/** Liveness + database reachability for container health checks and load balancers. Public by design, reveals nothing. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
