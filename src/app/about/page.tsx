import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { auth } from "@/auth";
import { Wordmark } from "@/components/Wordmark";

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
        <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.04em", color: "#111", lineHeight: 1, marginBottom: "0.5rem" }}>
          About <Wordmark />
        </h1>
        <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.875rem", color: "#9CA3AF", marginBottom: "2.5rem" }}>
          A browser-based quantum circuit simulator powered by Rust and WebAssembly.
        </p>
        <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.9375rem", color: "#374151", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          <p>
            qu00b is a browser-based quantum circuit simulator. You place gates
            on a wire grid, hit Run, and it shows you the resulting probability
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
          <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>
            Display convention: qu00b labels basis states with q0 as the
            leftmost bit — the same order as the wire grid, where q0 is the top
            wire. Internally the state vector stores q0 at the least-significant
            bit position; the display is reversed so labels read left-to-right
            as q0 q1 q2 …
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
            Four things to try (and why they&rsquo;re strange)
          </h2>
          <p>
            Open the simulator and hit{" "}
            <a href="/circuit" style={{ color: "#14B8A6" }}>Try this</a>{" "}
            — each preset loads in one click. Here&rsquo;s what you&rsquo;re actually looking at.
          </p>
          <p>
            <strong>The fair coin.</strong> One Hadamard gate turns a definite 0 into a perfect
            50/50. That&rsquo;s not the computer being unsure — it&rsquo;s the qubit genuinely
            being both at once until you measure it. Run it 512 times and watch the two bars
            hover near half each.
          </p>
          <p>
            <strong>The Bell pair.</strong> Two qubits, entangled. Only the outcomes where they
            agree ever show up — both 0 or both 1, never a mix. On its own each qubit is still
            a 50/50 coin. But the moment you&rsquo;d measure one, the other&rsquo;s answer is
            fixed, instantly, with no signal passing between them. Two ordinary coins can&rsquo;t
            be correlated like this no matter how you flip them. Einstein hated it; the
            experiments keep proving it real.
          </p>
          <p>
            <strong>Deutsch&rsquo;s trick.</strong> Here&rsquo;s a real algorithm. There&rsquo;s
            a hidden one-bit function, and the only question is whether it&rsquo;s
            &ldquo;constant&rdquo; or &ldquo;balanced.&rdquo; A normal computer has to test it
            twice to be sure. This circuit answers in a single evaluation — the qubit comes out
            1 for balanced, 0 for constant, guaranteed. It&rsquo;s tiny and a little contrived,
            but it&rsquo;s the smallest honest proof that asking a question in superposition can
            cost strictly fewer steps than asking it one input at a time.
          </p>
          <p>
            <strong>Grover&rsquo;s search.</strong> Four items, one marked. A classical search
            needs up to four lookups — two on average. Grover finds it in one. Load
            Grover &mdash; 1 iter and the marked state climbs from 25% to 100% in a
            single pass: not by eliminating the other options but by rotating their
            amplitudes until destructive interference drives them to zero. Load step 2
            and it overshoots — the probability rotates back to uniform. Grover is a
            rotation, not a ratchet, and one step is exactly right for N=4.
          </p>
          <p>
            None of this is the computer being fast. It&rsquo;s the computer following different
            rules.
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
            project.
          </p>

          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#111", marginBottom: 0 }}>
            Questions?
          </h2>
          <p>
            Reach us on the <a href="/support" style={{ color: "#14B8A6" }}>support page</a>.
          </p>

        </div>
      </main>
      <Footer />
    </div>
  );
}
