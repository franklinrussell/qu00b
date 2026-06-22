import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CircuitSimulator } from "./CircuitSimulator";

export const metadata = {
  title: "Circuit — qu00b",
  description: "Build and simulate quantum circuits in your browser.",
};

export default async function CircuitPage() {
  let email: string | null = null;
  let name: string | null = null;
  let image: string | null = null;
  try {
    const session = await auth();
    email = session?.user?.email ?? null;
    name = session?.user?.name ?? null;
    image = session?.user?.image ?? null;
  } catch {
    // auth not yet configured
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header email={email} name={name} image={image} />
      <main style={{ flex: 1, maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem", width: "100%", boxSizing: "border-box" }}>
        <h1
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "2rem",
            letterSpacing: "0.04em",
            color: "#111",
            lineHeight: 1,
            marginBottom: "0.25rem",
          }}
        >
          Circuit Simulator
        </h1>
        <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.875rem", color: "#9CA3AF", marginBottom: "1.5rem" }}>
          Click a cell to place a gate. Click again to remove. Two-qubit gates: click control row first, then target.
        </p>
        <CircuitSimulator email={email} />
      </main>
      <Footer />
    </div>
  );
}
