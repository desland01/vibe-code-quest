# Content voice

This guide is for builders who direct AI agents and still own what ships. Write like a calm technical partner sitting beside the reader: direct, warm, practical, and never condescending.

## Core voice

- Address the reader as **you**. Refer to **your agent** when the advice changes how generated work should be directed or reviewed.
- Prefer plain words and active verbs. Explain necessary technical terms where they first matter.
- Keep most sentences under 20 words. Vary the rhythm, but remove clauses that do not change the decision.
- State the useful default clearly. Name the condition that would make the reader choose differently.
- Be honest about costs, failure modes, and operational ownership. Do not turn product guidance into product promotion.
- Assume the reader can make good decisions with concrete guidance. Do not teach down to them or imitate a computer-science course.

## Schema field conventions

### `hook`

Write one sharp sentence. It should create a useful mental model, not summarize every feature. Aim for roughly 5–12 words.

### `definition`

Use two or three plain-language sentences. First say what the thing is. Then say why it matters or where its boundary sits.

### `when_to_use`

Give three or four concrete situations. Start with the reader's need, workload, or constraint. Avoid vague entries such as “when scalability matters.”

### `tradeoffs.pros` and `tradeoffs.cons`

Give at least three honest advantages and two honest costs. Keep each item independently useful. Mention operating burden, lock-in, failure modes, or complexity when they materially affect the choice.

### `example`

Use a realistic app scenario in two or three sentences. Name the records, workflow, or user need. Include a useful instruction the reader could give an agent. Never use `foo`, `bar`, toy counters, or interview puzzles.

### `gotchas`

Write two or three imperative warnings. Tell the reader what to verify, restrict, measure, or review. Include an agent-aware warning wherever generated code commonly hides risk, such as unsafe migrations, missing authorization filters, unbounded queries, or invented APIs.

### `vibe_coder_default`

Give one decisive recommendation. Name current products when a product anchor makes the choice actionable, followed by the condition that justifies leaving the default.

### `quiz`

Ask one decision-oriented question with exactly three plausible options. The canonical answer must exactly match one option. Explain the governing idea, not merely why the other answers are wrong.

### `sources`

Use two to four primary sources per landmark. Prefer official documentation and stable documentation roots. Every named-product capability or recommendation needs a source, and every source records its checked date.

## Product naming

- Name concrete products in defaults when that gives the reader an actionable starting point.
- Add a short parenthetical anchor when the product's category is not obvious, such as “Neo4j (graph database).”
- Tie claims to documented capabilities. Do not infer guarantees from marketing language.
- Source every named-product claim with official documentation in the landmark and its regional review.
- Compare products only on facts needed for the decision. Avoid winner language, affiliate tone, and exhaustive shopping lists.

## Banned patterns

- Marketing fluff: “revolutionary,” “best-in-class,” “effortless,” or unsupported superlatives.
- “Simply” and “just” when they erase work, risk, or prerequisites.
- Interview-prep framing, trivia, textbook recitation, or “you may be asked” language.
- Hedge stacks such as “might possibly sometimes be useful.” State the default and its exception.
- Empty scale claims, including “built for scale,” without a concrete workload or constraint.
- Agent mysticism. Agents generate proposals and code; the reader still verifies behavior and owns the outcome.
- Fake universality. Do not claim one database, framework, or provider fits every app.

VOICE FROZEN — 2026-07-17. Later regions conform or record a justified deviation in their review artifact.
