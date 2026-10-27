import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page depends on who is logged in and on fresh data (like the Laravel app),
  // so pages are rendered per request instead of being cached
  cacheComponents: false,
  // PGlite (the demo database) ships a WebAssembly build of Postgres; load it as is
  serverExternalPackages: ["@electric-sql/pglite"],
  // The demo database applies the SQL migrations at startup, so they must be deployed too
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**/*"],
  },
  experimental: {
    // Enables forbidden() for 403 pages
    authInterrupts: true,
    serverActions: {
      // Photos are shrunk in the browser to at most 1.8 MB before upload
      bodySizeLimit: "3mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
