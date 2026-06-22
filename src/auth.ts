import NextAuth, { type DefaultSession } from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { OnejsonfileAdapter } from "@/lib/auth-adapter";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

const emailServer = process.env.EMAIL_SERVER;
const emailFrom = process.env.EMAIL_FROM;

console.log(
  "[auth] EMAIL_SERVER:",
  emailServer ? emailServer.replace(/:([^@]+)@/, ":***@") : "NOT SET"
);
console.log("[auth] EMAIL_FROM:", emailFrom ?? "NOT SET");

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: OnejsonfileAdapter(),
  providers: [
    Nodemailer({
      server: emailServer,
      from: emailFrom,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        console.log("[auth] sendVerificationRequest called");
        console.log("[auth]   to:", identifier);
        console.log("[auth]   url:", url);

        const nodemailer = await import("nodemailer");
        const transport = nodemailer.default.createTransport(
          provider.server as string
        );
        try {
          const info = await transport.sendMail({
            to: identifier,
            from: `qu00b <${provider.from}>`,
            subject: "Your qu00b sign in link",
            text: `Sign in to qu00b: ${url}\n\nThis link expires in 24 hours.`,
            html: `<p>Click to sign in to <strong>qu00b</strong>:</p><p><a href="${url}">${url}</a></p><p>This link expires in 24 hours.</p>`,
          });
          console.log("[auth] email sent, messageId:", info.messageId);
        } catch (err) {
          console.error("[auth] email send FAILED:", err);
          throw err;
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
