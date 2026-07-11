import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in the home directory otherwise
  // makes Turbopack infer the wrong root (see WORK_LEDGER 2026-07-11).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
