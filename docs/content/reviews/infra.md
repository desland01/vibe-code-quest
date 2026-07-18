# Infra / Hosting content review

Checked: 2026-07-17  
Checker: Codex worker; orchestrator URL verification pending

| Landmark | Claim | Primary source | Checked | Checker |
| --- | --- | --- | --- | --- |
| Serverless functions | Vercel Functions run server-side code without managing servers and expose documented limits. | https://vercel.com/docs/functions and https://vercel.com/docs/functions/limitations | 2026-07-17 | Codex worker; orchestrator verification pending |
| Serverless functions | AWS Lambda runs code in response to events without managing servers. | https://docs.aws.amazon.com/lambda/latest/dg/welcome.html | 2026-07-17 | Codex worker; orchestrator verification pending |
| VPS / single server | DigitalOcean Droplets are virtual machines and support SSH administration. | https://docs.digitalocean.com/products/droplets/ and https://docs.digitalocean.com/products/droplets/how-to/connect-with-ssh/ | 2026-07-17 | Codex worker; orchestrator verification pending |
| VPS / single server | Hetzner Cloud documents virtual server creation and operation. | https://docs.hetzner.com/cloud/servers/overview/ | 2026-07-17 | Codex worker; orchestrator verification pending |
| Containers | Docker containers isolate processes, while persistent data needs explicit storage. | https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/ and https://docs.docker.com/engine/storage/ | 2026-07-17 | Codex worker; orchestrator verification pending |
| Containers | Fly.io deploys applications from container images. | https://fly.io/docs/launch/deploy/ | 2026-07-17 | Codex worker; orchestrator verification pending |
| Edge compute | Cloudflare Workers run across a distributed network with documented runtime limits and observability. | https://developers.cloudflare.com/workers/reference/how-workers-works/, https://developers.cloudflare.com/workers/platform/limits/, and https://developers.cloudflare.com/workers/observability/ | 2026-07-17 | Codex worker; orchestrator verification pending |
| Static + CDN | Cloudflare Pages hosts full-stack and static applications on Cloudflare's network. | https://developers.cloudflare.com/pages/ | 2026-07-17 | Codex worker; orchestrator verification pending |
| Static + CDN | Cloudflare and Vercel document cache behavior for delivered content. | https://developers.cloudflare.com/cache/concepts/default-cache-behavior/ and https://vercel.com/docs/cdn-cache | 2026-07-17 | Codex worker; orchestrator verification pending |
| Managed platforms | Railway documents managed services and deployment workflows. | https://docs.railway.com/guides/services and https://docs.railway.com/guides/deployments | 2026-07-17 | Codex worker; orchestrator verification pending |
| Managed platforms | Render documents web services and background workers. | https://render.com/docs/web-services and https://render.com/docs/background-workers | 2026-07-17 | Codex worker; orchestrator verification pending |

## Voice-conformance self-check

- Direct, warm, second-person voice: PASS.
- Hooks are one sharp sentence of 5–12 words: PASS.
- Definitions use two plain-language sentences and state the boundary: PASS.
- Each landmark has four concrete use cases: PASS.
- Each landmark has at least three honest pros and two honest cons: PASS.
- Examples use realistic records or workflows and direct the reader's agent: PASS.
- Gotchas are imperative, practical, and agent-aware: PASS.
- Defaults are decisive, name sourced products, and state when to leave the default: PASS.
- Quizzes have exactly three plausible options and exact canonical answers: PASS.
- Each landmark has two to four official primary sources checked on 2026-07-17: PASS.
- No marketing fluff, “simply,” “just,” interview framing, hedge stacks, empty scale claims, or agent mysticism: PASS.

Deviations from `VOICE.md`: None.

## Orchestrator verification

**COMPLETE — 2026-07-17, mission orchestrator (Claude Fable 5).** All 19 unique source URLs HTTP-verified 200 on first pass. Region read for accuracy + VOICE.md conformance: edge-compute reviewed in full (accurate on latency/data-placement/runtime-limit tradeoffs), hooks/defaults reviewed across all 6 — decisive, sourced, honest; no banned patterns. VAL-030: no drafts remain in infra; manifest regenerated. APPROVED.
