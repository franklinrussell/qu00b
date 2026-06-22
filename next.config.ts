import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // wasm-pack --target web emits an init() that fetch()es the .wasm via import.meta.url.
  // Turbopack (default in Next.js 16) recognises new URL('./x.wasm', import.meta.url)
  // and includes the file as a static asset automatically — no custom loader needed.
  turbopack: {},
};

export default nextConfig;
