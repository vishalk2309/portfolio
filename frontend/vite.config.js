import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    react(),
    // Compresses images (incl. the public/ dir) on every production build.
    ViteImageOptimizer({
      png: { quality: 70 },
      jpg: { quality: 72 },
      jpeg: { quality: 72 },
      // SVGs are already tiny; keep them lossless-ish.
      svg: { multipass: true },
    }),
  ],
});
