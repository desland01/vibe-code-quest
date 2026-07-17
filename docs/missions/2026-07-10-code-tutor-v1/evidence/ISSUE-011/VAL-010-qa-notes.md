# VAL-010 QA notes — ISSUE-011 (2026-07-17)
- Pan/zoom trace: DrawFrame count=106 over 1.58s ≈ 67 FPS (≥50 required) during 6-step zoom-in, 30-step drag pan, 6-step zoom-out at 1440x900. Trace: VAL-010-perf-trace.json.gz (CDP devtools.timeline).
- 8 regions render from manifest; click → side panel with 6 landmark names; Escape closes with focus restore (e2e map-top.spec.ts).
- Keyboard-only traversal green; ?nocanvas=1 DOM fallback green; reduced-motion hook green (5/5 Playwright incl. anon-session regression).
