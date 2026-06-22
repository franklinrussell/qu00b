import type { UsersDoc, SessionsDoc, AuthMetaDoc, RateLimitDoc, CircuitsDoc, AccountsDoc } from "@/types";

const BASE_URL = "https://onejsonfile.com/api/v1/files";

async function read<T>(token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/${token}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`onejsonfile read failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function write<T>(token: string, data: T): Promise<void> {
  const res = await fetch(`${BASE_URL}/${token}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`onejsonfile write failed: ${res.status}`);
}

async function patch<T>(token: string, partial: T): Promise<void> {
  const res = await fetch(`${BASE_URL}/${token}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
  if (!res.ok) throw new Error(`onejsonfile patch failed: ${res.status}`);
}

function usersToken() {
  const t = process.env.ONEJSONFILE_USERS_TOKEN;
  if (!t) throw new Error("ONEJSONFILE_USERS_TOKEN not set");
  return t;
}

export async function readUsers(): Promise<UsersDoc> {
  try {
    return await read<UsersDoc>(usersToken());
  } catch {
    return {};
  }
}

export async function updateUsers(
  mutate: (d: UsersDoc) => UsersDoc | Promise<UsersDoc>
): Promise<UsersDoc> {
  const current = await readUsers();
  const next = await mutate(current);
  await write(usersToken(), next);
  return next;
}

function sessionsToken() {
  const t = process.env.ONEJSONFILE_SESSIONS_TOKEN;
  if (!t) throw new Error("ONEJSONFILE_SESSIONS_TOKEN not set");
  return t;
}

function authMetaToken() {
  const t = process.env.ONEJSONFILE_AUTH_TOKEN;
  if (!t) throw new Error("ONEJSONFILE_AUTH_TOKEN not set");
  return t;
}

export async function readSessions(): Promise<SessionsDoc> {
  try {
    return await read<SessionsDoc>(sessionsToken());
  } catch {
    return {};
  }
}

export async function updateSessions(
  mutate: (d: SessionsDoc) => SessionsDoc | Promise<SessionsDoc>
): Promise<SessionsDoc> {
  const current = await readSessions();
  const next = await mutate(current);
  await write(sessionsToken(), next);
  return next;
}

export async function readAuthMeta(): Promise<AuthMetaDoc> {
  try {
    const raw = await read<Partial<AuthMetaDoc>>(authMetaToken());
    return { verificationTokens: raw.verificationTokens ?? {} };
  } catch {
    return { verificationTokens: {} };
  }
}

export async function updateAuthMeta(
  mutate: (d: AuthMetaDoc) => AuthMetaDoc | Promise<AuthMetaDoc>
): Promise<AuthMetaDoc> {
  const current = await readAuthMeta();
  const next = await mutate(current);
  await write(authMetaToken(), next);
  return next;
}

function rateLimitToken(): string | null {
  return process.env.ONEJSONFILE_RATELIMIT_TOKEN ?? null;
}

export async function readRateLimit(): Promise<RateLimitDoc> {
  const token = rateLimitToken();
  if (!token) return {};
  try {
    return await read<RateLimitDoc>(token);
  } catch {
    return {};
  }
}

export async function patchRateLimit(partial: RateLimitDoc): Promise<void> {
  const token = rateLimitToken();
  if (!token) return;
  await patch(token, partial);
}

function accountsToken() {
  const t = process.env.ONEJSONFILE_ACCOUNTS_TOKEN;
  if (!t) throw new Error("ONEJSONFILE_ACCOUNTS_TOKEN not set");
  return t;
}

export async function readAccounts(): Promise<AccountsDoc> {
  try {
    return await read<AccountsDoc>(accountsToken());
  } catch {
    return {};
  }
}

export async function updateAccounts(
  mutate: (d: AccountsDoc) => AccountsDoc | Promise<AccountsDoc>
): Promise<AccountsDoc> {
  const current = await readAccounts();
  const next = await mutate(current);
  await write(accountsToken(), next);
  return next;
}

function circuitsToken() {
  const t = process.env.ONEJSONFILE_CIRCUITS_TOKEN;
  if (!t) throw new Error("ONEJSONFILE_CIRCUITS_TOKEN not set");
  return t;
}

export async function readCircuits(): Promise<CircuitsDoc> {
  try {
    return await read<CircuitsDoc>(circuitsToken());
  } catch {
    return {};
  }
}

export async function updateCircuits(
  mutate: (d: CircuitsDoc) => CircuitsDoc | Promise<CircuitsDoc>
): Promise<CircuitsDoc> {
  const current = await readCircuits();
  const next = await mutate(current);
  await write(circuitsToken(), next);
  return next;
}
