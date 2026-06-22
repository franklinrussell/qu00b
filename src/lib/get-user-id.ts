import { auth } from "@/auth";
import { cookies } from "next/headers";

const sessionCache = new Map<string, { userId: string; exp: number }>();
const TTL = 5 * 60 * 1000;

async function getCookieToken(): Promise<string | null> {
  try {
    const jar = await cookies();
    return (
      jar.get("authjs.session-token")?.value ??
      jar.get("__Secure-authjs.session-token")?.value ??
      null
    );
  } catch {
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  const token = await getCookieToken();

  if (token) {
    const hit = sessionCache.get(token);
    if (hit && hit.exp > Date.now()) return hit.userId;
  }

  try {
    const session = await auth();
    if (session?.user?.id) {
      if (token)
        sessionCache.set(token, {
          userId: session.user.id,
          exp: Date.now() + TTL,
        });
      return session.user.id;
    }
  } catch {
    if (token) {
      const stale = sessionCache.get(token);
      if (stale) return stale.userId;
    }
  }

  return null;
}
