import { Logo } from "@/components/Logo";
import Link from "next/link";
import { GitHubSignIn } from "./GitHubSignIn";

export const metadata = {
  title: "Sign in — qu00b",
};

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        background: "#fff",
      }}
    >
      <Link href="/" style={{ marginBottom: "1.5rem", display: "block" }}>
        <Logo size={48} />
      </Link>
      <h1
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "2rem",
          letterSpacing: "0.04em",
          color: "#111",
          lineHeight: 1,
          marginBottom: "0.375rem",
          textAlign: "center",
        }}
      >
        Save your circuits
      </h1>
      <p
        style={{
          fontFamily: "var(--font-jakarta)",
          fontSize: "0.875rem",
          color: "#9CA3AF",
          marginBottom: "2rem",
          textAlign: "center",
          maxWidth: "320px",
        }}
      >
        Sign in with GitHub to save and revisit your circuits across sessions.
        No account needed to run the simulator.
      </p>
      <GitHubSignIn />
    </div>
  );
}
