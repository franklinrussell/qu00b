import { readRateLimit, patchRateLimit } from "@/lib/onejsonfile";

const EMAIL_LIMIT = 5;
const IP_LIMIT = 10;

function hourBucket(): string {
  return String(Math.floor(Date.now() / 3_600_000));
}

async function hashKey(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

export async function checkSignInRateLimit({
  email,
  ip,
}: {
  email: string | null;
  ip: string;
}): Promise<{ limited: boolean }> {
  if (!process.env.ONEJSONFILE_RATELIMIT_TOKEN) {
    console.warn("[ratelimit] ONEJSONFILE_RATELIMIT_TOKEN not set — rate limiting disabled");
    return { limited: false };
  }

  const hour = hourBucket();
  const ipKey = `i_${await hashKey(ip)}_${hour}`;
  const emailKey = email ? `e_${await hashKey(email.toLowerCase())}_${hour}` : null;

  const doc = await readRateLimit();

  const ipCount = doc[ipKey] ?? 0;
  const emailCount = emailKey ? (doc[emailKey] ?? 0) : 0;

  if (ipCount >= IP_LIMIT || (emailKey && emailCount >= EMAIL_LIMIT)) {
    return { limited: true };
  }

  const increment: Record<string, number> = { [ipKey]: ipCount + 1 };
  if (emailKey) increment[emailKey] = emailCount + 1;
  await patchRateLimit(increment);

  return { limited: false };
}
