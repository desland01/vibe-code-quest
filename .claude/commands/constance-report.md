---
name: constance-report
description: Generate the Constance owner report — one self-contained HTML file covering runtime function (hooks wired/fired/crashed), locked constants by tier with the pinned floor, provenance counts, open notes, the decline timeline, and loop history — with a sticky Print / Save-as-PDF button.
argument-hint: "[--out <path>]"
---

# /constance-report

Produce the owner-facing Constance report for this project and hand back the file path.

## Steps

1. Run the CLI from the project root (pass through any `--out <path>` argument the user gave):

   ```bash
   constance report $ARGUMENTS
   ```

   Dev checkouts without a global install: `npx tsx <constance-repo>/cli/constance.ts report $ARGUMENTS`.

2. The command prints the output path. Return it to the user as a clickable `file://` link so one
   click opens the report in a browser. The sticky header's **Print / Save as PDF** button produces
   the PDF — no other tooling needed.

## Rules

- ALL data comes from the CLI. Do NOT open `.constance/` stores, logs, or secret files yourself to
  "enrich" the report — the raw store is off-limits to the working agent (ADR 0006); the report
  generator inside the CLI is the sanctioned reader.
- Report FACTS only when describing it: it records wiring, firing, and constants on record. Do not
  describe the report as proving truthfulness or preventing hallucination (R002) — it is a
  function report.
- If `constance report` exits non-zero or prints a RED function banner, surface that loudly and
  point the user at `constance status` for the mechanical detail — never summarize a red state as
  healthy.
