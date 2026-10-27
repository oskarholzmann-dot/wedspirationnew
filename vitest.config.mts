import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Starting PGlite and running the migrations takes a moment
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
