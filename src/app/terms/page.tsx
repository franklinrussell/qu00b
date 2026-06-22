import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { auth } from "@/auth";

export const metadata = { title: "Terms — qu00b" };

export default async function TermsPage() {
  let email: string | null = null;
  let name: string | null = null;
  let image: string | null = null;
  try {
    const s = await auth();
    email = s?.user?.email ?? null;
    name = s?.user?.name ?? null;
    image = s?.user?.image ?? null;
  } catch {}

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header email={email} name={name} image={image} />
      <main style={{ flex: 1, maxWidth: "680px", margin: "0 auto", padding: "3rem 1.5rem", width: "100%", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.04em", color: "#111", lineHeight: 1, marginBottom: "2rem" }}>
          Terms of Service
        </h1>
        <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.9375rem", color: "#374151", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p><strong>Last updated:</strong> June 2026</p>

          <p>
            Welcome. qu00b is a browser-based quantum circuit simulator. It&rsquo;s
            free to use, the source is public, and we&rsquo;re genuinely glad
            you&rsquo;re here. These terms are the boring-but-necessary legal
            wrapper around that.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            Using qu00b
          </h2>
          <p>
            Use it to learn, to experiment, to teach, to build demos. Personal,
            educational, and non-commercial use is wide open. If you want to do
            something commercial with it, the source is MIT / Apache-2.0 licensed,
            so you probably can — just read the license.
          </p>
          <p>
            The one thing that will get you banned: deliberately breaking things for
            other users. Don&rsquo;t do that.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            Your saved circuits
          </h2>
          <p>
            Circuits you save belong to you. We store them on your behalf. We
            won&rsquo;t sell them, read them for ads, or do anything weird with
            them. If an account has been completely inactive for a very long time
            (we&rsquo;re talking years), we reserve the right to clean it up —
            but we&rsquo;d rather not.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            The math is real; the warranty is not
          </h2>
          <p>
            qu00b simulates quantum circuits using real linear algebra. The
            probabilities it outputs are mathematically correct to floating-point
            precision. That said, this is a learning tool, not a certified
            research instrument. Don&rsquo;t use it as the sole basis for
            published results without verifying against a second source.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            Changes
          </h2>
          <p>
            If we update these terms in a meaningful way, we&rsquo;ll note the
            new date at the top. Continued use after an update means you&rsquo;re
            cool with the new terms.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            Questions
          </h2>
          <p>
            <a href="/support" style={{ color: "#14B8A6" }}>Support page</a> — we read everything.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
