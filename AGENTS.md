# Vibe Tutor Project Instructions

Applies to `/Users/thebeast/vibe-tutor`.

This project is a local-first Vite + React + TypeScript app. It uses static lesson data, deterministic feedback, and browser `localStorage`; do not add auth, a database, AI provider calls, deployment, or background jobs without an explicit product decision.

## Source Of Truth

- Keep `CLAUDE.md` and `AGENTS.md` synchronized when either file changes.
- Use project-level files before global defaults when instructions overlap.
- Do not edit global rules, skills, or home-directory agent files unless the user explicitly asks.
- Preserve user changes. If a worktree is dirty, work around unrelated edits and do not revert them.

## Core Engineering Standards

- Docs before code: check official, current documentation before changing frameworks, libraries, APIs, deployment providers, or external services.
- Long-term over quick fixes: avoid one-off patches that create future cleanup.
- Prefer simple, explicit implementations. Do not add abstractions, configuration, or speculative flexibility for a single-use need.
- Type-safe contracts first: validate inputs at boundaries and keep shared schemas/contracts as the source of truth.
- Respect architectural boundaries: keep UI, API, background jobs, and data-layer concerns separated.
- Accessibility baseline: maintain accessible touch/click targets and include loading, empty, and error states for data-driven UI.
- Match existing formatting, naming, and design conventions before introducing new patterns.
- Current verification commands are `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`.

## Karpathy Guidelines

- Think before coding: state assumptions when they matter, name multiple interpretations, and ask only when local context cannot answer safely.
- Simplicity first: write the minimum code, prompt, rule, or workflow that solves the actual request.
- Surgical changes: touch only the files and lines required by the task. Clean up only unused artifacts created by the current change.
- Goal-driven execution: turn tasks into verifiable goals before implementation.
- For multi-step tasks, use a short plan with verification gates.
- Use `/Users/thebeast/karpathy-mind/skills/karpathy-spec/SKILL.md` for durable specs, implementation contracts, agent/model optimization plans, or Autoresearch setup.

## Web And Frontend Rules

- Preserve any existing design system. Do not mix unrelated visual systems on the same surface.
- For websites across mobile, tablet, desktop, and split-screen, hero sections must use auto-varying height rather than rigid `100vh`, `100svh`, or `100dvh`.
- Scale text and spacing proportionally so layout remains stable across viewport sizes.
- For public websites, proposal pages, onboarding pages, service pages, and SEO-opportunity pages, phone CTA labels must read exactly `Call Now`.
- Public website cards should not use eyebrow/kicker labels by default. The card title should be the first meaningful text unless a documented design review approves an exception.
- Public resource hubs should prioritize real links to service pages, tools, forms, articles, and high-value BOFU pages.
- Do not show near-me pages on resource hubs. Treat near-me pages as local-intent third-layer pages.

## Browsing And Research

- Use the gstack `/browse` skill for all web browsing. Do not use built-in browser or Chrome control tools for web browsing.
- For implementation research, prefer official documentation and primary sources.
- When facts can change, verify them live before treating them as current.

## Skill Routing

- Move product work through the gstack stage stack when the user asks for end-to-end completion: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review` or `/design-consultation`, implementation, `/review`, `/qa`, then `/ship` or `/land-and-deploy` only when a real git/deploy target exists.
- Use `/committee` for meaningful product, architecture, stack, pricing, or launch decisions that require multiple specialist frames.
- The reusable committee skill is global at `/Users/thebeast/.claude/skills/committee/SKILL.md`, `/Users/thebeast/.agents/skills/committee/SKILL.md`, and `/Users/thebeast/.codex/skills/committee/SKILL.md`.
- Committee scratchpads live under `/Users/thebeast/AI-OS/research/committee/<domain-slug>/findings.md`.
- Do not run `/ship` as a commit/push workflow while this folder has no `.git` repository or remote. Use local verification, browser QA, and ledger closeout instead.

## Deployment Verification

- After any deploy command, watch the deployment until it reaches a terminal state.
- Verify the actual production URL with `/browse` before saying the work is deployed.
- A pushed commit, created project, alias, or CLI `ready` state is not enough by itself.
- For Vercel work, inspect deployment/project state, confirm the latest production URL, load it with `/browse`, check visible text, and inspect console/network failures when user-visible behavior matters.
- If the provider says ready but the site cannot be loaded or verified, report it as not verified and keep debugging.

## Work Ledger

- Keep `/Users/thebeast/vibe-tutor/WORK_LEDGER.md` updated for any session that changes files, deploys, researches, audits, plans, fixes, or makes project decisions.
- If this folder later becomes a git repo, continue using the ledger at the repo root.
- Ledger sections must be: `Completed Work`, `Open To-Dos`, `Nice-To-Haves`, and `Decisions / Notes`.
- Preserve history with dated entries. Mark finished items as done and leave unfinished items visible.

## Audio Brief Routing

- Store all audio briefs under `/Users/thebeast/audio-briefs/`, never under this repo's `docs/`.
- Route by content, not current working directory.
- Use `/Users/thebeast/audio-briefs/vibe-tutor/` only when the brief is about this repo's code, architecture, dashboard, or roadmap.
- Use a topic-area scope for personal, partnership, or strategy briefs outside this repo.
- Follow `/Users/thebeast/.hom/skills/audio-brief/SKILL.md` and the pinned Hume Octave voice settings when generating audio.

## Verification Before Closeout

- Run available project checks before finalizing changes: type-check, lint, build, relevant tests, and visual verification when applicable.
- If no checks exist yet, say so clearly and verify with file inspection or the narrowest available command.
- Final responses should summarize changed files, verification run, and any open to-dos from `WORK_LEDGER.md`.
