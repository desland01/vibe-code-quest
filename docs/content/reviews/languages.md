# Languages content review

Checked: 2026-07-17  
Checker: Codex worker; orchestrator URL verification pending

## JavaScript and TypeScript

- JavaScript is the web's programming language → https://developer.mozilla.org/en-US/docs/Web/JavaScript → 2026-07-17 → Codex worker
- TypeScript adds static types and compiles to JavaScript → https://www.typescriptlang.org/docs/ → 2026-07-17 → Codex worker
- TypeScript checks code before execution but does not replace runtime validation → https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html → 2026-07-17 → Codex worker

Voice conformance: PASS. The default is decisive, the booking example directs an agent, and the warnings distinguish static checks from runtime trust.

## Python

- Python is a general-purpose language with readable syntax → https://docs.python.org/3/tutorial/ → 2026-07-17 → Codex worker
- Python includes a broad standard library → https://docs.python.org/3/library/ → 2026-07-17 → Codex worker
- Python packaging guidance recommends isolated environments for third-party packages → https://packaging.python.org/en/latest/tutorials/installing-packages/ → 2026-07-17 → Codex worker

Voice conformance: PASS. Uses are workload-specific, costs include dependency drift, and the example protects source data.

## HTML and CSS

- HTML defines web content structure and meaning → https://developer.mozilla.org/en-US/docs/Web/HTML → 2026-07-17 → Codex worker
- CSS controls presentation and layout → https://developer.mozilla.org/en-US/docs/Web/CSS → 2026-07-17 → Codex worker
- Semantic HTML supports accessible interaction → https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML → 2026-07-17 → Codex worker

Voice conformance: PASS. The section starts from semantics, gives rendered-page verification steps, and avoids framework-first advice.

## Types and contracts

- TypeScript describes common value shapes → https://www.typescriptlang.org/docs/handbook/2/everyday-types.html → 2026-07-17 → Codex worker
- Narrowing refines types after runtime checks → https://www.typescriptlang.org/docs/handbook/2/narrowing.html → 2026-07-17 → Codex worker
- Python type hints do not enforce annotations at runtime → https://docs.python.org/3/library/typing.html → 2026-07-17 → Codex worker

Voice conformance: PASS. The boundary between static types and runtime contracts is explicit, with an agent-aware webhook example.

## Runtimes and packages

- Node.js runs JavaScript outside the browser → https://nodejs.org/en/learn/getting-started/introduction-to-nodejs → 2026-07-17 → Codex worker
- npm packages and modules package reusable code → https://docs.npmjs.com/about-packages-and-modules → 2026-07-17 → Codex worker
- `npm ci` installs from a lockfile and exits on incompatible package metadata → https://docs.npmjs.com/cli/commands/npm-ci → 2026-07-17 → Codex worker
- npm documents dependency vulnerability auditing → https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities → 2026-07-17 → Codex worker

Voice conformance: PASS. The section treats packages as an operational choice and tells the reader how to review agent-added dependencies.

## Reading code you did not write

- JavaScript programs contain statements, functions, and event-driven behavior → https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript → 2026-07-17 → Codex worker
- Function signatures expose inputs and outputs → https://www.typescriptlang.org/docs/handbook/2/functions.html → 2026-07-17 → Codex worker
- Python distinguishes syntax errors from runtime exceptions and supports explicit handling → https://docs.python.org/3/tutorial/errors.html → 2026-07-17 → Codex worker

Voice conformance: PASS. The central regional message is explicit: syntax is the road sign, not the road. Review guidance centers behavior, risk, and ownership.

## Region-wide voice check

- Direct, warm, second-person voice: PASS.
- Three or four concrete use cases per landmark: PASS.
- At least three pros and two cons per landmark: PASS.
- Real scenarios with instructions for your agent: PASS.
- Imperative, agent-aware gotchas: PASS.
- Decisive defaults with clear exceptions: PASS.
- No marketing fluff, condescension, trivia, or banned filler: PASS.

## Orchestrator verification

**COMPLETE — 2026-07-18, mission orchestrator (Claude Opus 4.8).** All 19 unique source URLs HTTP-verified 200 on first pass (MDN, typescriptlang.org, docs.python.org, nodejs.org, npm, packaging.python.org). Reviewed hooks/defaults across all 6 + reading-generated-code in full: regional thesis ("syntax is the road sign, not the road") carried well; defaults concrete and correct (strict TS for agent-written web apps, Python for data/AI, semantic HTML first, LTS Node + lockfiles); reading-generated-code centers verifying behavior/trust boundaries over memorizing syntax. VOICE-conformant, no banned patterns. VAL-030: no drafts remain. APPROVED.
