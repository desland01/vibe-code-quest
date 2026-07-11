# Issues Validation — mechanical check (per ADR-0003)

Run: 2026-07-10, orchestrator. Checked ISSUES.md (27 issues) against PRD v2 + VALIDATION_CONTRACT v2.

| Check | Result | Notes |
|---|---|---|
| No vague-bucket issues | PASS | Every issue names bound (files/dirs it may touch) and a done-definition; no "polish"/"misc" buckets. |
| No unbounded repo scan to start | PASS | ISSUE-000 classifies only the known-dirty `docs/missions/**`; no issue begins with "explore the codebase". |
| No hidden chat dependency | PASS | Worker-prompt rule at top of ISSUES.md: issue text + REQ + VAL + named artifacts only. Named input artifacts (map-style.md, TAXONOMY.md, VOICE.md, exemplar region) are all produced by earlier issues and committed. |
| Every issue maps to a real REQ | PASS | REQ-001..018 all covered; ISSUE-000 maps to VAL-003 only (pre-flight, no REQ) — allowed pattern. |
| Every issue maps to real VALs | PASS | All referenced VAL ids exist in VALIDATION_CONTRACT v2 (VAL-001..003, 010..014, 020..022, 030..038, 040..043, 050..052, 060..061). |
| Every AFK issue self-sufficient | PASS | Bounds, inputs, acceptance in each; content slices carry taxonomy+voice+exemplar inputs (adversarial F5 control). |
| HITL issues name the exact decision | PASS | ISSUE-032 enumerates HITL-PRICE / HITL-NAME / HITL-LEGAL / HITL-LIVE / D3 re-confirmation. ISSUE-009 has an explicit HITL escape hatch. |
| ISSUE-000 clean-tree pattern | PASS | Provenance classification, owned-paths-only staging, STOP-on-foreign, per-file provenance in commit message — no blanket commit. |
| Dependency graph acyclic + explicit | PASS | Serial spine listed; no forward references. |
| REQ coverage completeness | PASS | Reverse map: REQ-001(001), 002(003), 003(011,013), 004(012), 005(004,005), 006(006), 007(010), 008(009,015,016-022), 009(023), 010(024), 011(008,025), 012(007), 013(007,027), 014(028), 015(029), 016(031), 017(002,030), 018(026). No orphan REQ. |
| VAL coverage completeness | PASS | Every VAL is claimed by ≥1 issue; VAL-052/042 also re-checked at the final gate. |

Formatting/link integrity: headers well-formed; artifact paths consistent (`docs/content/`, `designs/`, `docs/launch/`).

**Result: PASS — reviews.issues = pass.**
