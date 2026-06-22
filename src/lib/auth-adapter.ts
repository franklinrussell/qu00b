import type {
  Adapter,
  AdapterUser,
  AdapterSession,
  VerificationToken,
} from "@auth/core/adapters";
import {
  readUsers,
  updateUsers,
  readSessions,
  updateSessions,
  readAuthMeta,
  updateAuthMeta,
} from "@/lib/onejsonfile";
import type { Qu00bUser } from "@/types";

function toAdapterUser(id: string, u: Qu00bUser): AdapterUser {
  return { id, email: u.email, emailVerified: null, name: null, image: null };
}

export function OnejsonfileAdapter(): Adapter {
  return {
    async createUser(user) {
      const id = crypto.randomUUID();
      const qu00bUser: Qu00bUser = {
        email: user.email ?? "",
        createdAt: new Date().toISOString(),
      };
      await updateUsers((doc) => ({ ...doc, [id]: qu00bUser }));
      return toAdapterUser(id, qu00bUser);
    },

    async getUser(id) {
      const doc = await readUsers();
      const u = doc[id];
      return u ? toAdapterUser(id, u) : null;
    },

    async getUserByEmail(email) {
      const doc = await readUsers();
      const entry = Object.entries(doc).find(([, u]) => u.email === email);
      return entry ? toAdapterUser(entry[0], entry[1]) : null;
    },

    async getUserByAccount() {
      return null;
    },

    async updateUser(user) {
      const doc = await readUsers();
      const u = doc[user.id];
      return u
        ? toAdapterUser(user.id, u)
        : { id: user.id, email: user.email ?? "", emailVerified: null, name: null, image: null };
    },

    async linkAccount() {
      return undefined;
    },

    async createSession(session) {
      await updateSessions((d) => ({
        ...d,
        [session.sessionToken]: {
          userId: session.userId,
          expires: session.expires.toISOString(),
        },
      }));
      return session;
    },

    async getSessionAndUser(sessionToken) {
      const [sessionsDoc, usersDoc] = await Promise.all([
        readSessions(),
        readUsers(),
      ]);
      const s = sessionsDoc[sessionToken];
      if (!s) return null;
      const u = usersDoc[s.userId];
      if (!u) return null;
      return {
        session: {
          sessionToken,
          userId: s.userId,
          expires: new Date(s.expires),
        },
        user: toAdapterUser(s.userId, u),
      };
    },

    async updateSession({ sessionToken, expires }) {
      let result: AdapterSession | null = null;
      await updateSessions((d) => {
        const s = d[sessionToken];
        if (!s) return d;
        const newExpires = expires?.toISOString() ?? s.expires;
        result = {
          sessionToken,
          userId: s.userId,
          expires: new Date(newExpires),
        };
        return { ...d, [sessionToken]: { ...s, expires: newExpires } };
      });
      return result;
    },

    async deleteSession(sessionToken) {
      await updateSessions((d) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [sessionToken]: _, ...rest } = d;
        return rest;
      });
    },

    async createVerificationToken(token) {
      await updateAuthMeta((d) => ({
        ...d,
        verificationTokens: {
          ...d.verificationTokens,
          [`${token.identifier}:${token.token}`]: {
            identifier: token.identifier,
            token: token.token,
            expires: token.expires.toISOString(),
          },
        },
      }));
      return token;
    },

    async useVerificationToken({ identifier, token }) {
      let found: VerificationToken | null = null;
      await updateAuthMeta((d) => {
        const key = `${identifier}:${token}`;
        const entry = d.verificationTokens[key];
        if (!entry) return d;
        found = {
          identifier: entry.identifier,
          token: entry.token,
          expires: new Date(entry.expires),
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: _, ...rest } = d.verificationTokens;
        return { ...d, verificationTokens: rest };
      });
      return found;
    },
  };
}
