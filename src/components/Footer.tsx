import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #F0F0F0",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          textDecoration: "none",
        }}
      >
        <Logo size={22} />
        <span
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "0.95rem",
            letterSpacing: "0.04em",
            color: "#111",
            lineHeight: 1,
          }}
        >
          QU|00&#x27E9;B
        </span>
        <span
          style={{
            fontFamily: "var(--font-jakarta)",
            fontSize: "0.75rem",
            color: "#9CA3AF",
          }}
        >
          Meet your first qubit.
        </span>
      </Link>

      <nav style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
        {[
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
          { label: "Support", href: "/support" },
          { label: "Source ↗", href: "https://github.com/franklinrussell/qu00b" },
        ].map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: "0.75rem",
              color: "#9CA3AF",
              textDecoration: "none",
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
