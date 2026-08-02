# MECHANICAL VALIDATION REPORT — ISSUES.md

Mission: `2026-08-02-vibe-code-quest-arcade`
Date: 2026-08-02
Validation type: Mechanical (formatting and link integrity only)

---

## Validation Results

| Assertion | PASS/FAIL | Evidence |
|-----------|-----------|----------|
| A1 | **PASS** | All 33 issues (ISSUE-001 through ISSUE-033) contain all required fields: Milestone, Label, Depends on, Covers, Validated by, Files expected to change, Scope, Acceptance criteria, Out of bounds |
| A2 | **PASS** | All REQ IDs referenced in ISSUES.md (REQ-001 through REQ-029) exist as headings in PRD.md |
| A3 | **PASS** | All VAL IDs referenced in ISSUES.md exist in VALIDATION_CONTRACT.md table |
| A4 | **PASS** | All REQ-001 through REQ-029 are covered by at least one issue. Coverage verified: REQ-001 (ISSUE-003, 012, 013, 014, 024-030), REQ-002 (ISSUE-003, 024-030), REQ-003 (ISSUE-013, 024-030), REQ-004 (ISSUE-014, 024-030), REQ-005 (ISSUE-003, 012, 024-030), REQ-006 (ISSUE-004, 005, 024-030), REQ-007 (ISSUE-003, 012, 024-030), REQ-008 (ISSUE-015), REQ-009 (ISSUE-008, 009), REQ-010 (ISSUE-015), REQ-011 (ISSUE-017, 022, 031), REQ-012 (ISSUE-031), REQ-013 (ISSUE-018), REQ-014 (ISSUE-008, 009), REQ-015 (ISSUE-018), REQ-016 (ISSUE-021), REQ-017 (ISSUE-019), REQ-018 (ISSUE-020), REQ-019 (ISSUE-020), REQ-020 (ISSUE-006, 024-030), REQ-021 (ISSUE-004, 005, 006, 007, 011, 024-030, 032), REQ-022 (ISSUE-002, 033), REQ-023 (ISSUE-005, 032), REQ-024 (ISSUE-005, 010, 032), REQ-025 (ISSUE-022), REQ-026 (ISSUE-033), REQ-027 (ISSUE-008, 012, 013, 014, 023-030), REQ-028 (ISSUE-016), REQ-029 (ISSUE-001, 032) |
| A5 | **PASS** | All issue Milestone values are valid: M0 (ISSUE-001, 002), M1a (ISSUE-003-011), M1b (ISSUE-012-014), M2 (ISSUE-015-020), M3 (ISSUE-021-023), M4 (ISSUE-024-025), M5 (ISSUE-026-028), M6 (ISSUE-029-031), M7 (ISSUE-032-033). All match milestones in EXECUTION_PLAN.md |
| A6 | **PASS** | No vague-bucket issues found. All scopes enumerate specific targets: specific files, specific databases, specific VAL IDs, specific landmark counts. No uses of "various", "etc", "and more", "as needed", "miscellaneous", "cleanup" without enumeration |
| A7 | **PASS** | No unbounded repository scans. All scopes are bounded to specific file paths, glob patterns, or named directories. No "scan the repo", "audit everything", "find all" without bounds |
| A8 | **PASS** | No hidden chat dependency. No scope contains "as discussed", "per the conversation", "the decision we made", or similar references to chat history |
| A9 | **PASS** | All AFK issues are self-sufficient. Each AFK issue's Scope plus named artifacts (PRD, VALIDATION_CONTRACT, DATA_MODEL, CREATIVE_BIBLE, EXECUTION_PLAN, AMENDMENT-A4, repo-map) are sufficient for a fresh agent. No AFK issue names an unresolved decision |
| A10 | **PASS** | All HITL issues (ISSUE-001, 002, 021, 022, 023, 032, 033) name the exact decision in a single identifiable sentence: ISSUE-001 asks to append amendment entry; ISSUE-002 classification/cleanup; ISSUE-021 asks "Which of the three main theme variants... should ship"; ISSUE-022 asks "Does the character direction... have owner approval"; ISSUE-023 asks "Does the voice... have owner approval"; ISSUE-032 asks owner approval for cutover; ISSUE-033 asks owner approval for running 0012 |
| A11 | **PASS** | Dependency integrity verified. ISSUE-001 has no dependencies (Depends on: none). All 'Depends on' values reference real ISSUE IDs. No cycles detected. ISSUE-001 is the root issue with no predecessors |
| A12 | **FAIL** | File path validation issue: ISSUE-003 lists `e2e/beats.spec.ts` and `src/__tests__/beats.test.ts` but doesn't specify whether these are new or existing. ISSUE-010 lists `src/__tests__/withNeonBranch.test.ts` without confirming it exists. ISSUE-016 lists `src/components/TitleScreen.tsx` as "(new)" but other files like `app/page.tsx (or new title route)` are ambiguous. ISSUE-031 lists `src/__tests__/access.test.ts (or new src/__tests__/avatar.test.ts)` which is ambiguous about which file will be created |
| A13 | **PASS** | ISSUE-002 explicitly forbids blanket commit in Out of bounds: "NEVER run `git add -A` or `git add .` — blanket staging is forbidden" |
| A14 | **PASS** | All issues 024 through 030 explicitly state the island-worker restriction: ISSUE-024 (line 396): "Writes only under `src/content/databases/`; never touches `src/content/index.ts`, `src/content/regions.ts`, `src/content/schema.ts`, or the manifest — those are integrator-only, serial, shared files". ISSUE-025 (line 411), ISSUE-026 (line 429), ISSUE-027 (line 443), ISSUE-028 (line 457), ISSUE-029 (line 475), ISSUE-030 (line 489) all contain identical language. ISSUE-024 through ISSUE-030 all include this restriction |

---

## Failures Requiring Fix

### A12 — File Path Clarity

**FAIL:** Several issues have ambiguous file path specifications that don't clearly indicate whether files exist or will be created:

1. **ISSUE-003**: Lists `e2e/beats.spec.ts` and `src/__tests__/beats.test.ts` without specifying whether these are existing files to be modified or new files to be created. Other files in the same issue have clear "(new)" markers (e.g., ISSUE-009 lists `e2e/stage-fit.spec.ts` (new)).

2. **ISSUE-010**: Lists `src/__tests__/withNeonBranch.test.ts` without confirming it exists on disk. Should specify "(existing)" or "(new)".

3. **ISSUE-016**: Uses ambiguous phrasing "app/page.tsx (or new title route)" and "src/components/TitleScreen.tsx (new)" — unclear which file will actually be created or modified.

4. **ISSUE-031**: Lists "src/__tests__/access.test.ts (or new src/__tests__/avatar.test.ts)" which doesn't resolve which file will be created.

**Required fix:** For each file listed under "Files expected to change", either:
- Mark as "(existing)" if the file exists on disk at `/Users/thebeast/code-tutor/`
- Mark as "(new)" if it will be created
- Resolve "or" alternatives to a single definitive path

---

## Summary

**MECHANICAL VALIDATION: FAIL (1 failure)**

Total assertions: 14
Passed: 13
Failed: 1

The single failure (A12) is a file path clarity issue that prevents a fresh agent from determining which files exist versus which will be created. This is resolvable by adding explicit "(new)" or "(existing)" markers to ambiguous file paths.

All other mechanical checks pass: all issues have required fields, all referenced REQ/VAL IDs exist, all requirements are covered, all milestones are valid, no vague scopes or unbounded scans, no chat dependencies, all AFK issues are self-sufficient, all HITL issues have clear decision questions, dependencies are valid with no cycles, ISSUE-002 forbids blanket commits, and all island-worker issues (024-030) include the required shared-file restriction.
