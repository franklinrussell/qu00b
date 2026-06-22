import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { auth } from "@/auth";

export const metadata = { title: "Terms — qu00b" };

export default async function TermsPage() {
  let email: string | null = null;
  try { const s = await auth(); email = s?.user?.email ?? null; } catch {}

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header email={email} />
      <main style={{ flex: 1, maxWidth: "680px", margin: "0 auto", padding: "3rem 1.5rem", width: "100%", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.04em", color: "#111", lineHeight: 1, marginBottom: "2rem" }}>
          Terms of Service
        </h1>
        <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.9375rem", color: "#374151", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p><strong>Last updated:</strong> June 2026</p>
          <p>qu00b is provided as-is for educational and exploratory use. By using this service you agree to these terms.</p>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>Use</h2>
          <p>You may use qu00b for personal, educational, and non-commercial purposes. Don&rsquo;t abuse the service or attempt to harm other users.</p>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>Data</h2>
          <p>Saved circuits are stored on your behalf. We may delete inactive accounts and associated data after extended periods of inactivity.</p>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>Warranty</h2>
          <p>This service is provided without warranty. The simulation is mathematically correct to floating-point precision but is not certified for production quantum research.</p>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>Contact</h2>
          <p><a href="/support" style={{ color: "#14B8A6" }}>Support page</a> for questions.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
