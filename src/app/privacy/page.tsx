import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { auth } from "@/auth";

export const metadata = { title: "Privacy — qu00b" };

export default async function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.9375rem", color: "#374151", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p><strong>Last updated:</strong> June 2026</p>

          <p>
            qu00b is a quantum circuit simulator. The simulation engine is WebAssembly
            and runs entirely in your browser — no circuit data is sent to any server
            unless you explicitly save it.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            What we collect when you sign in
          </h2>
          <p>
            Authentication is handled by GitHub OAuth. When you sign in, we receive
            from GitHub and store:
          </p>
          <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>Your GitHub user ID (used as a stable account identifier)</li>
            <li>Your GitHub username (<code>@login</code>)</li>
            <li>Your GitHub avatar URL</li>
            <li>Your public email address, if one is set on your GitHub profile</li>
          </ul>
          <p>
            We do not receive your GitHub password, private repositories, or any
            data beyond what is listed above.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            Saved circuits
          </h2>
          <p>
            If you sign in and save a circuit, it is stored in onejsonfile (a simple
            JSON storage service) keyed to your account. You can delete saved circuits
            at any time from the simulator. You can also delete your account by
            contacting us via the <a href="/support" style={{ color: "#14B8A6" }}>support page</a>.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            Anonymous use
          </h2>
          <p>
            You can build and run circuits without signing in. No data is collected
            in anonymous mode.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            Cookies
          </h2>
          <p>
            A single session cookie is set by NextAuth when you sign in to keep you
            authenticated. No third-party tracking cookies.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            Contact
          </h2>
          <p>
            Questions? <a href="/support" style={{ color: "#14B8A6" }}>Contact us via the support page</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
