import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // wasm-pack --target web emits ESM; Next.js needs experimental.serverComponentsExternalPackages
  // is not needed here since wasm runs client-side only.
  // The generated src/qsim-pkg/ is imported as a local package.
  webpack(config) {
    // Enable wasm loading in webpack
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
