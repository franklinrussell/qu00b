import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { auth } from "@/auth";

export const metadata = {
  title: "About — qu00b",
  description: "What qu00b is, how it works, and where the name comes from.",
};

export default async function AboutPage() {
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
          About qu00b
        </h1>
        <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.9375rem", color: "#374151", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          <p>
            qu00b is a browser-based quantum circuit simulator. You drag gates
            onto a wire grid, hit Run, and it shows you the resulting probability
            distribution — no cloud, no install, no quantum hardware required.
            The whole thing runs in your browser tab.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            How the engine works
          </h2>
          <p>
            Most quantum simulators represent state as a 2<sup>n</sup> × 2<sup>n</sup>{" "}
            matrix. qu00b doesn&rsquo;t. Instead it tracks the state vector
            directly — a list of 2<sup>n</sup> complex amplitudes, one per
            computational basis state. Each gate is applied by mutating just
            the entries it affects, which keeps things fast enough to run live
            in a browser tab without a loading spinner.
          </p>
          <p>
            The simulation engine is written in Rust, compiled to WebAssembly
            via wasm-pack. The UI is Next.js. The two talk to each other through
            a thin TypeScript wrapper. When you click Run, no network request
            is made — the Wasm module runs locally in your JS engine.
          </p>
          <p>
            The source is public:{" "}
            <a
              href="https://github.com/franklinrussell/qu00b"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#14B8A6" }}
            >
              github.com/franklinrussell/qu00b
            </a>
            .
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            The name
          </h2>
          <p>
            In quantum mechanics, |00⟩ is Dirac (ket) notation for the
            two-qubit state where both qubits are in the ground state — the
            simplest starting point for a circuit. qu00b is that: the starting
            point. A place to build your first qubit intuition before the
            textbooks make it complicated.
          </p>
          <p>
            The slashed zeros in the wordmark are there so the digits read as
            digits and not letter O. A small detail, but this is a tool about
            precision.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            Built by
          </h2>
          <p>
            qu00b is a{" "}
            <a
              href="https://birchtreestudio.dev"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#14B8A6" }}
            >
              Birch Tree Studio
            </a>{" "}
            project. Questions or feedback — <a href="/support" style={{ color: "#14B8A6" }}>support page</a>.
          </p>

        </div>
      </main>
      <Footer />
    </div>
  );
}
