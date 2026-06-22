import type { Metadata } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://qu00b.app"),
  title: "qu00b",
  description: "Meet your first qubit. A browser-based quantum circuit simulator.",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: "qu00b",
    description: "Meet your first qubit. A browser-based quantum circuit simulator.",
    url: "https://qu00b.app/",
    siteName: "qu00b",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "qu00b",
    description: "Meet your first qubit. A browser-based quantum circuit simulator.",
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebas.variable} ${jakarta.variable}`}>
      <body style={{ background: "#fff", margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
