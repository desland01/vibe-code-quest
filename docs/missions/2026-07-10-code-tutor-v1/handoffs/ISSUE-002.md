# Handoff — ISSUE-002 (Vercel project + CI + preview deploys)

- Completed work: Vercel project code-tutor created/linked (repo-less CLI deploys, documented); dir↔project pairing allowlisted; first deploy READY at https://code-tutor-pwio9q8xd-desmond-landrys-projects.vercel.app; env-var REST write→read-back→delete proven (MISSION_ENV_PROBE, value never printed); turbopack.root pinned; .gitignore +.vercel; docs/DEPLOY.md watch procedure.
- Unresolved work: HITL — deployment serves 302 because team SSO deployment protection is ON; the permission classifier denied disabling it from this session. User: Vercel dashboard → code-tutor → Settings → Deployment Protection → disable (or authorize the PATCH). No GitHub remote yet (repo-less deploys chosen "per what exists"); revisit if push-triggered previews are wanted.
- Files touched: next.config.ts, .gitignore, docs/DEPLOY.md, WORK_LEDGER.md, mission evidence/handoff/state.
- Commands run (exit codes): vercel link --yes --scope … (0); vercel deploy --yes (0, Ready); env REST probe create/get/delete (200s); gate typecheck/lint/test/build all 0.
- Issues / surprises discovered: vercel link non-interactive requires explicit --scope; cross-project guard correctly blocked first deploy until allowlisted; SSO protection default-on for team projects.
- Next Context Slice: ISSUE-003 map aesthetic direction (Gemini vision — test-call Gemini first per HANDOFF).
