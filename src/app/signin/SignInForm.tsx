"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

const ACCENT = "#14B8A6";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("nodemailer", {
        email: email.trim().toLowerCase(),
        redirect: false,
        callbackUrl: "/circuit",
      });
      if (result?.error) {
        setError("Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        style={{
          textAlign: "center",
          fontFamily: "var(--font-jakarta)",
          maxWidth: "360px",
        }}
      >
        <div
          style={{
            fontSize: "2rem",
            marginBottom: "0.75rem",
          }}
        >
          ✉️
        </div>
        <p style={{ fontSize: "1rem", color: "#111", fontWeight: 500, marginBottom: "0.5rem" }}>
          Check your inbox
        </p>
        <p style={{ fontSize: "0.875rem", color: "#9CA3AF" }}>
          We sent a magic link to <strong>{email}</strong>. It expires in 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "12px" }}
    >
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "12px 14px",
          border: "1px solid #E5E5E5",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-jakarta)",
          fontSize: "1rem",
          outline: "none",
          color: "#111",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = ACCENT;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}33`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#E5E5E5";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {error && (
        <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.8rem", color: "#FF3B30" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "12px",
          border: "none",
          borderRadius: "0.75rem",
          background: loading ? "#9CA3AF" : ACCENT,
          color: "#fff",
          fontFamily: "var(--font-jakarta)",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
