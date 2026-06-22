import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SupportForm } from "./SupportForm";

export const metadata = {
  title: "Support — qu00b",
  description: "Questions about qu00b? Send a message and we'll get back to you.",
};

export default async function SupportPage() {
  let email: string | null = null;
  let name: string | null = null;
  let image: string | null = null;
  try {
    const session = await auth();
    email = session?.user?.email ?? null;
    name = session?.user?.name ?? null;
    image = session?.user?.image ?? null;
  } catch {
    // anonymous mode
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header email={email} name={name} image={image} />
      <main style={{ flex: 1, maxWidth: "560px", margin: "0 auto", padding: "3rem 1.5rem", width: "100%", boxSizing: "border-box" }}>
        <h1
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "2.5rem",
            letterSpacing: "0.04em",
            color: "#111",
            lineHeight: 1,
            marginBottom: "0.375rem",
          }}
        >
          Support
        </h1>
        <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.875rem", color: "#9CA3AF", marginBottom: "2.25rem" }}>
          We&rsquo;ll get back to you within a day or two.
        </p>
        <SupportForm email={email} />
      </main>
      <Footer />
    </div>
  );
}
