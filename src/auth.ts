import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { OnejsonfileAdapter } from "@/lib/auth-adapter";
import { updateUsers } from "@/lib/onejsonfile";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

async function fetchPrimaryEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!res.ok) return null;
    const emails: Array<{ email: string; primary: boolean; verified: boolean }> =
      await res.json();
    return emails.find((e) => e.primary && e.verified)?.email ?? null;
  } catch {
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: OnejsonfileAdapter(),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: { params: { scope: "read:user user:email" } },
      async profile(profile, tokens) {
        const email =
          profile.email ||
          (tokens.access_token
            ? await fetchPrimaryEmail(tokens.access_token)
            : null) ||
          "";
        return {
          id: profile.id.toString(),
          name: profile.login,
          email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Backfill email for existing accounts that signed in before user:email scope was added
      if (
        account?.provider === "github" &&
        !user.email &&
        account.access_token &&
        user.id
      ) {
        const email = await fetchPrimaryEmail(account.access_token);
        if (email) {
          await updateUsers((doc) => {
            const u = doc[user.id!];
            if (u && !u.email) {
              return { ...doc, [user.id!]: { ...u, email } };
            }
            return doc;
          });
          user.email = email;
        }
      }
      return true;
    },
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
