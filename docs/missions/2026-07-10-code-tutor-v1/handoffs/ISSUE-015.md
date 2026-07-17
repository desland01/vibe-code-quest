# ISSUE-015 handoff — Databases gold standard + VOICE.md (VAL-030/037/038)

## Completed work

- Worker (codex gpt-5.6-sol): all 6 Databases landmarks authored to full schema, `draft: false` (sql expanded from the design-doc seed; nosql-document, vector, graph, orm-vs-raw-sql, hosted-vs-self-hosted-databases authored fresh); `docs/content/VOICE.md` distilled and **FROZEN** (field-by-field conventions, banned patterns, deviation rule); `docs/content/reviews/databases.md` accuracy artifact; manifest regenerated.
- Orchestrator verification (recorded in the review artifact): all 21 source URLs HTTP-verified (1 dead PostgreSQL link found and replaced); full-region content read + accuracy/voice review by orchestrator; VOICE.md approved as the M4 bar.
- Region live on preview (https://code-tutor-b4ksdryph-desmond-landrys-projects.vercel.app/map/databases) — screenshot in evidence; no draft chips.

## Evidence

- `docs/content/reviews/databases.md` (VAL-037/038 incl. orchestrator verification section) · `docs/content/VOICE.md` (frozen) · `evidence/ISSUE-015/VAL-001-gate.txt` · `evidence/ISSUE-015/preview-sql-landmark.png`.

## Template for ISSUE-016..022 (repeat per region, one issue each)

1. Dispatch sol worker with: taxonomy ids for the region + VOICE.md + sql.ts as exemplar + same field-quality spec + real primary-source URLs (checked 2026-07-17+), draft:false, review artifact with per-claim source table, build:manifest + typecheck/lint/test.
2. Orchestrator: curl-verify every source URL (fix dead ones via terra), read the region for voice/accuracy, record verification in the review artifact, gate, deploy preview, screenshot, commit.

## Next Context Slice

ISSUE-016 Infra/Hosting region (then 017 AI Types, 018 Git, 019 Languages, 020 Security, 021 Design Systems, 022 PM Tools — strictly serial).
