import Link from "next/link";
import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Wordmark } from "@/components/Wordmark";

export default async function HomePage() {
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
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1.5rem",
          textAlign: "center",
        }}
      >
        <Logo size={72} />
        <h1
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(3rem, 10vw, 6rem)",
            letterSpacing: "0.04em",
            color: "#111",
            lineHeight: 1,
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <Wordmark />
        </h1>
        <p
          style={{
            fontFamily: "var(--font-jakarta)",
            fontSize: "1.125rem",
            color: "#9CA3AF",
            marginBottom: "2.5rem",
            maxWidth: "480px",
          }}
        >
          Build a circuit and watch quantum get weird. Runs entirely in your
          browser — powered by Rust and WebAssembly, no server involved.
        </p>
        <Link
          href="/circuit"
          style={{
            display: "inline-block",
            background: "#14B8A6",
            color: "#fff",
            fontFamily: "var(--font-jakarta)",
            fontWeight: 600,
            fontSize: "1rem",
            padding: "0.75rem 2rem",
            borderRadius: "0.75rem",
            textDecoration: "none",
          }}
        >
          Let&rsquo;s go
        </Link>
        <Link
          href="/about"
          style={{
            marginTop: "1rem",
            fontFamily: "var(--font-jakarta)",
            fontSize: "0.8rem",
            color: "#9CA3AF",
            textDecoration: "none",
          }}
        >
          what is this?
        </Link>
      </main>
      <Footer />
    </div>
  );
}
