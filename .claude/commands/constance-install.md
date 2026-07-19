---
name: constance-install
description: Turn this directory into a fully protected Constance project — verified constants, session-start rendering, read-ban + action-gate + stop-guard hooks, and the mechanically-triggered anti-drift loop — then walk the repo's governing documents through the verification gauntlet. One command, no gaps, reversible with `constance uninstall`.
argument-hint: "[--skip-gauntlet] [--domain \"industry hint\"]"
---

# /constance-install

Turn the current directory into a Constance project with the ENTIRE constants architecture active:

1. **Verified store** — every load-bearing claim in your governing docs becomes a checked constant.
2. **Session discipline** — each session starts from the signed, bounded `constants.md` view.
3. **Mechanical enforcement** — read-ban, pre-execution action gate, and stop decline-guard hooks.
4. **Drift protection** — the anti-drift loop (reviewer/curator) fires automatically on session
   start and turn cadence; the working agent never re-derives state ad hoc.

Everything is previewed before writing, recorded in an install manifest, and reversible with
`constance uninstall`.

## Doctrine (read before acting)

- **You are the working agent, not the verifier.** Constance draws constraint boxes; it does not
  judge decisions. Never soften a claim to sneak it past the gauntlet; a declined claim is recorded
  honestly (`constance decline`), never silently dropped.
- **Two stores, one view.** `constance declare` writes constants to
  `.constance/<env>.constants.sqlite`; `constance ground` writes stamped authority bricks to
  `.constance/<env>.sqlite`. The working view is `constants.md` — generated ONLY by
  `constance loop` / `constance session-start`, never hand-edited. The raw stores are audit-only
  (`constance list`) and the hooks will deny you reading them directly. This is by design.
- **Atomic constants.** One verb, one obligation, one value per rule — no `and`/`or`/comma lists.
  A doc with one compound sentence often yields several constants. More constants than claims is
  correct, not a failure.
- **The convergence loop is the failure protocol.** A rejected declare prints a split hint; a
  `gap` ground names the failing verifier. Feed the engine's own error back, repair only the
  failures, re-run — until zero failures. Never accept a partial batch; never silently drop.
- **Honest enforcement tiers.** On Claude Code, read-ban/action-gate/stop-guard are mechanical
  hooks; the in-session compression contract is prose (advisory). Do not claim more than the
  runtime enforces.
- **One question at a time.** In the interview phase, ask exactly one plain-prose question per
  turn with a recommended answer inline. Never batch questions.

## Phase 0 — Preflight

1. Verify the CLI: run `constance doctor`. If the command is missing, stop and tell the user the
   one-line install (`npm i -g <the constance package>` or the tarball path they were given), then
   re-verify. Doctor must report healthy (Node ≥ 22.13) before anything else.
2. Run `git status --short`. If the tree is dirty, tell the user what's uncommitted and recommend
   committing first (installing into a dirty tree makes the install commit noisy). Proceed only if
   they say so or the tree is clean. Not a git repo → note it and continue; nothing here requires git.
3. If `.constance/` already exists, this is an **optimize** run: skip `constance install`'s init leg
   (it detects this itself) and focus on net-new claims in Phase 2.

## Phase 1 — Mechanical install

Run:

```
constance install --yes
```

This is the explicit consent ceremony (the user invoked this command; `--yes` accepts the preview).
It performs, and records in `.constance/install-manifest.json`:

- `constance init` (fresh store) if the directory is not yet adopted.
- `.claude/settings.json` hook wiring (deep-merged, never clobbering existing hooks):
  SessionStart → `constance hook session-start`, PreToolUse Read|Bash → `constance hook
  pre-tool-use`, PreToolUse Write|Edit → `constance hook action-gate`, Stop → `constance hook stop`.
- The Constance operating contract appended to `CLAUDE.md` inside `<!-- constance:begin/end -->`
  fences.
- This command file dropped at `.claude/commands/constance-install.md` (so the project carries it).

Then verify: `constance doctor` again, and confirm the hooks answer — e.g.
`echo '{}' | constance hook stop` exits 0. Tell the user the hooks take effect for NEW sessions
(the current session's hook set was loaded at startup).

If the user passed `--skip-gauntlet`, stop here and report: the architecture is active with an
empty (or existing) store, and they can run this command again anytime to constrain their docs.

## Phase 2 — Audit: find and classify every load-bearing claim

Inventory the governing documents: README, CLAUDE.md/AGENTS.md, CONTEXT.md, PRD/design docs,
business/pricing docs, compliance notes, contracts — anything that states a rule, number, path,
threshold, commitment, or prohibition. Use subagents (fresh-context, read-only) to sweep large
repos in parallel; each returns a claim list, one falsifiable claim per line, with source file
and line.

Classify every claim:

- **A-machine** — expressible as a checkable predicate today (paths, thresholds, commands,
  invariants) → declare queue. No research needed.
- **B-third-party** — verifiable against an external primary source (law, regulation, standard,
  API doc, published pricing, platform policy) → research queue.
- **C-interview** — owner-only knowledge, strategy, taste, or too vague to verify → interview
  queue (last resort; keep it minimal — a C-claim that is actually B-verifiable belongs in B).

Keep the ledger in `.constance-bootstrap/claims.jsonl`
(`{id, source_file, text, class, status, evidence}` per line) so the run is resumable.

## Phase 3 — Research: verify the B-queue against primary sources

For each B-claim, fetch the primary source (official documentation, the statute/regulation text,
the vendor's published policy — never a summary when the primary text is reachable) with whatever
web tools this session has. Record per claim: VERIFIED (quote + citation + retrieval date),
REFUTED (correction + citation — then fix the source doc surgically), or UNRESOLVABLE (reclassify
to C with a note on what was searched). Save fetched sources under `.constance-bootstrap/grounding/`
with a URL + date header.

## Phase 4 — Declare & ground: the convergence loop

For every A-claim and VERIFIED B-claim, draft atomic declarations, then run the real CLI:

- `constance declare "<atomic rule>" --tier user-decision --field <snake_case> --kind
  string|number|boolean --op "==" --value <v>` — constants the engine will check mechanically.
- `constance ground "<claim>" --type authority --source <ONE official URL>` — authority claims;
  ONE authority per claim (split multi-statute claims), official sources over mirrors.

Run the loop until 100%: capture every failure with the engine's own output, repair only the
failures (compound rejects → re-split per the printed hint; `gap` grounds → correct single
authority, or reroute a non-authority rule to a plain `declare`), re-run the repaired subset.
Zero failures is the exit condition. A ground that still cannot stamp is recorded as a GAP with
the parent rule noted — honestly, never dropped.

## Phase 5 — Interview: the C-queue, one question at a time

For each residual C-claim: state the claim, where it came from, why it couldn't be verified
mechanically or externally, and a proposed constraint wording with your recommended answer — then
ask ONE question and wait. Run each answer through declare/ground the same turn. Declines are
recorded with `constance decline`. Answers that are atomic, unambiguous, and concretely checkable
mint constants; anything else becomes an owner note (`constance notes`), never a forced constant.

## Phase 6 — Compile, verify, close

1. `constance loop` — derive the final `constants.md` (reviewer reconciles; the pinned floor and
   open gaps render). Then `constance session-start` and read the view: this is what every future
   session sees.
2. If any load-bearing constant was demoted out of the capped view, tell the user which ones and
   recommend pinning (pinning grows the floor — allowed; shrinking the floor requires their
   explicit sign-off, always).
3. Run the project's own verification gate if it has one (tests/typecheck/build).
4. Write `.constance-bootstrap/INSTALL-REPORT.md`: counts per class, both store totals (declared
   constants + stamped bricks), declined claims, open notes, and the revert instructions
   (`constance uninstall` — removes hooks + fenced contract via the manifest; the verified store
   stays unless `--purge-store`).
5. If this is a git repo and the user approves, commit the install (settings, CLAUDE.md fences,
   command file, constants.md, ledger) as one commit.
6. End with a plain-English summary: what is now constrained, what is mechanically enforced, what
   fires automatically (the drift loop), and what still floats (open notes / gaps).

## Failure protocol

- `constance` not on PATH mid-run → stop, re-verify Phase 0; never substitute hand-edited files
  for CLI output.
- Declare/ground failures are the convergence loop, not blockers (Phase 4).
- A hook self-check failing after install → run `constance uninstall`, report exactly what
  failed, and do not leave a half-wired settings file (the manifest revert guarantees this).
- Anything requiring spend, deployment, or an external mutation → ask first. Nothing in this
  command requires any of those.
