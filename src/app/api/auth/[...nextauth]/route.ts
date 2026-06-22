import { handlers } from "@/auth";
import { type NextRequest, NextResponse } from "next/server";
import { checkSignInRateLimit } from "@/lib/ratelimit";

export const { GET } = handlers;

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  if (url.pathname === "/api/auth/signin/nodemailer") {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "127.0.0.1";

    let email: string | null = null;
    try {
      const body = await req.clone().text();
      email = new URLSearchParams(body).get("email")?.toLowerCase().trim() ?? null;
    } catch {
      // IP-only limiting still applies
    }

    const { limited } = await checkSignInRateLimit({ email, ip });
    if (limited) {
      return NextResponse.json({ error: "RateLimited" }, { status: 429 });
    }
  }

  return handlers.POST(req);
}
