import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { auth } from "@/auth";

export const metadata = { title: "Privacy — qu00b" };

export default async function PrivacyPage() {
  let email: string | null = null;
  try { const s = await auth(); email = s?.user?.email ?? null; } catch {}

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header email={email} />
      <main style={{ flex: 1, maxWidth: "680px", margin: "0 auto", padding: "3rem 1.5rem", width: "100%", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.04em", color: "#111", lineHeight: 1, marginBottom: "2rem" }}>
          Privacy Policy
        </h1>
        <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.9375rem", color: "#374151", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p><strong>Last updated:</strong> June 2026</p>
          <p>qu00b is a quantum circuit simulator that runs entirely in your browser. The simulation engine is WebAssembly and processes no data on our servers.</p>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>What we collect</h2>
          <p>If you sign in, we store your email address and your saved circuits in onejsonfile (a simple JSON storage service). We do not collect analytics, sell data, or track behavior.</p>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>Cookies</h2>
          <p>We use a single session cookie set by NextAuth to keep you signed in. No third-party tracking cookies.</p>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>Contact</h2>
          <p>Questions? <a href="/support" style={{ color: "#14B8A6" }}>Contact us via support</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
