# Deploying code-tutor

Project: `desmond-landrys-projects/code-tutor` (Vercel, repo-less CLI deploys — no git remote wired yet).

## Deploy
- Preview: `vercel deploy --yes` from the repo root (dir↔project pairing allowlisted in `~/.claude/vercel-project-map.json`).
- Production: `vercel deploy --prod --yes` — gated by mission rules (billing/email surfaces only after VAL-043 legal pages).

## Watch procedure
1. `vercel ls` — newest deployment row; wait for `● Ready`.
2. `vercel inspect <url>` — confirms `status Ready`; add `--logs` for build output on failure.
3. `curl -s -o /dev/null -w "%{http_code}" <url>` — expect 200 (currently 302: team SSO deployment protection is ON; disabling it is a pending user action).

## Env vars
Write via Vercel REST API only (never `vercel env add` stdin, never echo): POST `/v10/projects/$PID/env?teamId=$TEAM`, verify with GET read-back, multi-line secrets as `<NAME>_B64`. Proven 2026-07-11 with MISSION_ENV_PROBE (created → read back → deleted).
