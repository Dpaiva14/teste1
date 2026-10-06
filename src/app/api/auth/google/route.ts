import { NextResponse, type NextRequest } from "next/server";
import { beginGoogleAuth } from "@/lib/auth/google";
import { errorResponse } from "@/lib/http";
import { HttpError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const url = await beginGoogleAuth(req.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(url);
  } catch (e) {
    if (e instanceof HttpError && e.code === "NOT_CONFIGURED") {
      return NextResponse.redirect(new URL("/login?error=google_not_configured", req.url));
    }
    return errorResponse(e);
  }
}
