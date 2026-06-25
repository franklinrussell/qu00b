"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .footer-root {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 14px 16px !important;
          }
          .footer-tagline { display: none; }
          .footer-nav { flex-wrap: wrap; gap: 0.5rem 1rem; }
        }
      `}</style>
      <footer
        className="footer-root"
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
              <Wordmark />
            </span>
          </Link>
          <span
            className="footer-tagline"
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: "0.75rem",
              color: "#9CA3AF",
            }}
          >
            Both 0 and 1.
          </span>
          <span
            className="footer-tagline"
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: "0.75rem",
              color: "#9CA3AF",
            }}
          >
            ·{" "}
            <a
              href="https://birchtreestudio.dev"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-jakarta)",
                fontSize: "0.75rem",
                color: "#9CA3AF",
                textDecoration: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Birch Tree Studio
            </a>
          </span>
        </div>

        <nav className="footer-nav" style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
          {[
            { label: "About", href: "/about" },
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Support", href: "/support" },
            { label: "Source", href: "https://github.com/franklinrussell/qu00b" },
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
    </>
  );
}
