"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Logo } from "./Logo";
import { Wordmark } from "./Wordmark";

const ACCENT = "#14B8A6";

interface HeaderProps {
  email: string | null;
  name?: string | null;
  image?: string | null;
}

export function Header({ email, name, image }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const displayLabel = name ?? email?.[0]?.toUpperCase() ?? "?";
  const isSignedIn = !!email || !!name;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#fff",
        borderBottom: "1px solid #F0F0F0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 1.5rem",
        height: "56px",
        flexShrink: 0,
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          textDecoration: "none",
        }}
      >
        <Logo size={28} />
        <span
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "1.15rem",
            letterSpacing: "0.04em",
            color: "#111",
            lineHeight: 1,
          }}
        >
          <Wordmark />
        </span>
      </Link>

      {isSignedIn ? (
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="User menu"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: image ? "transparent" : ACCENT,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-jakarta)",
              fontSize: "0.875rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              overflow: "hidden",
            }}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={displayLabel}
                width={32}
                height={32}
                style={{ borderRadius: "50%", display: "block" }}
              />
            ) : (
              displayLabel[0]?.toUpperCase()
            )}
          </button>

          {open && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "208px",
                background: "#fff",
                borderRadius: "0.75rem",
                border: "1px solid #E5E5E5",
                boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                padding: "4px 0",
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  fontFamily: "var(--font-jakarta)",
                  fontSize: "0.75rem",
                  color: "#9CA3AF",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                {name ? `@${name}` : email}
              </div>
              <div style={{ height: "1px", background: "#F0F0F0", margin: "4px 0" }} />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFB"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  fontFamily: "var(--font-jakarta)",
                  fontSize: "0.875rem",
                  color: "#374151",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/signin"
          style={{
            fontFamily: "var(--font-jakarta)",
            fontSize: "0.8rem",
            color: "#9CA3AF",
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
      )}
    </header>
  );
}
