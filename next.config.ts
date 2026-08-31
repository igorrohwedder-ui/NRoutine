import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mantemos nosso próprio CLAUDE.md (specs/memória do projeto) — sem isso,
  // `next dev`/`next build` sobrescreve o arquivo com "@AGENTS.md" a cada run.
  agentRules: false,
};

export default nextConfig;
