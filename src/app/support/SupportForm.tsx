"use client";

import { useState } from "react";

const ACCENT = "#14B8A6";

export function SupportForm({ email }: { email: string | null }) {
  const [name, setName] = useState("");
  const [emailVal, setEmailVal] = useState(email ?? "");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: emailVal, message }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    padding: "10px 12px",
    border: "1px solid #E5E5E5",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-jakarta)",
    fontSize: "0.9375rem",
    color: "#111",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  if (sent) {
    return (
      <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.9375rem", color: "#374151" }}>
        Message sent — we&rsquo;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <input
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}33`; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.boxShadow = "none"; }}
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={emailVal}
        readOnly={!!email}
        onChange={(e) => setEmailVal(e.target.value)}
        style={{ ...inputStyle, color: email ? "#9CA3AF" : "#111", background: email ? "#FAFAFA" : "#fff" }}
        onFocus={(e) => { if (!email) { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}33`; } }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.boxShadow = "none"; }}
      />
      <textarea
        required
        placeholder="How can we help?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        style={{ ...inputStyle, resize: "vertical" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}33`; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5E5"; e.currentTarget.style.boxShadow = "none"; }}
      />
      {error && <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.8rem", color: "#FF3B30" }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "11px",
          border: "none",
          borderRadius: "0.75rem",
          background: loading ? "#9CA3AF" : ACCENT,
          color: "#fff",
          fontFamily: "var(--font-jakarta)",
          fontWeight: 600,
          fontSize: "0.9375rem",
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
