# ADHD Engagement Research Synthesis — code-tutor v2

**Date:** 2026-07-19 · **Method note:** Two five-leaf research fleets (deleg_4b102524, deleg_f8bfe6ac) produced zero durable output in this environment (delegation results never re-entered; `docs/research/adhd-engagement/raw/` empty on disk). This synthesis was therefore produced by the orchestrator directly: 11 anchor-topic web searches + full-page extraction of the load-bearing sources, all in-session on 2026-07-19. Every citation below was personally located and, where marked [EXTRACTED], read at source this session. If fleet output arrives later, merge as corroboration, not authority.

## Headline finding

**There is essentially no published research on gamified learning adherence in adult ADHD founders (or adult ADHD learners generally).** The ADHD digital-intervention literature is overwhelmingly pediatric and clinical (Gabarron et al. 2025 umbrella review of 26 systematic reviews, 2018–2025 [EXTRACTED]; Caselles-Pina et al. 2023 on video-game ADHD interventions — pediatric, adherence high but symptom-focused, not learning-design-focused). **Consequence: the design contract rests on three supports — (a) strong general adult-learning science, (b) adult ADHD clinical knowledge used cautiously as hypothesis, (c) target-founder usability testing as the decisive evidence layer.** Anyone claiming more certainty than this is selling something.

## Graded claims table

| # | Claim | Population | Grade | Source (verified 2026-07-19) | Contract rule it licenses |
|---|---|---|---|---|---|
| 1 | Practice testing and distributed practice are the two highest-utility study techniques across dozens of studies | Students/general adult | **Strong peer-reviewed** | Dunlosky et al. 2013 [R1] [EXTRACTED] | Every landmark ends in a `check` beat; testing is the product, not an add-on |
| 2 | Answering prequestions/pretests before instruction improves later learning, even when answers are wrong | Students/general adult | **Strong peer-reviewed** (review + meta-analysis) | Pan & Carpenter 2023 [R2] [EXTRACTED]; St Hilaire et al. 2024 [R3] (located) | `predict` beat before every reveal; wrong predictions never penalized |
| 3 | Worked examples outperform unaided problem-solving for novices at initial learning; fade guidance as expertise grows | Novices (varied) | **Strong peer-reviewed** | Sweller canon [R4]; Chen et al. 2023 [R5]; van Gog et al. 2011 [R6] (both located) | `reveal` beats carry the worked answer; `scenario` decisions come after, not before |
| 4 | Artificial advancement toward a goal increases persistence to completion ("endowed progress") | Adult consumers | **Peer-reviewed** (marketing science; context = loyalty programs) | Nunes & Drèze 2006 [R7] (located) | Region pips framed as progress made |
| 5 | Effort accelerates as goal proximity increases ("goal gradient") | Adult consumers | **Peer-reviewed** | Kivetz, Urminsky & Zheng 2006 [R8] [EXTRACTED via author PDF] | "4 of 6 stamped" pull framing; next-landmark offer at stamp moment |
| 6 | Intrinsic motivation tracks satisfaction of autonomy, competence, relatedness | General | **Strong peer-reviewed** (foundational theory) | Ryan & Deci 2000 [R9] (located) | No coercion mechanics; competence-indexed rewards only; autonomy = always a clean exit |
| 7 | Struggling on ill-structured problems before instruction can improve conceptual learning ("productive failure") — BUT requires careful facilitation and is not novice-proof | Students | **Moderate peer-reviewed** (existence proofs, facilitation-dependent) | Kapur 2008 [R10] (located) | Supports `predict` before teach; forbids unaided scenarios without the reveal |
| 8 | A pedagogy-informed custom AI tutor produced significantly more learning in less time than in-class active learning in one RCT | College physics students | **Moderate** (single RCT, short lessons, custom tutor) | Kestin et al. 2025 [R11] [EXTRACTED] | AI works as a designed help rail; does NOT license AI-chat-as-primary-teacher |
| 9 | FSRS outperforms SM-2 on scheduling benchmarks | SRS users | **Engineering artifact** (open benchmark, not peer-reviewed) | open-spaced-repetition/srs-benchmark [R12] (located) | Spaced resurface = post-pilot; simple `dueAt` date math first |
| 10 | Moving/auto-updating content that starts automatically, lasts >5s, and runs parallel to other content must be pausable/stoppable/hidable; interaction-triggered animation must be disable-able where non-essential | All users (a11y) | **Standard (WCAG 2.2)** | SC 2.2.2 [R13] [EXTRACTED from W3C]; SC 2.3.3 [R14] (located) | Celebration ≤ a few loops then still; reduced-motion fallbacks mandatory |
| 11 | Digital interventions for ADHD show promise; adherence to game-based ADHD interventions is high — but the evidence is pediatric/clinical, not adult learning design | Pediatric ADHD (mostly) | **Strong for pediatric; absent for adult ADHD learning** | Gabarron et al. 2025 [R15] [EXTRACTED]; Caselles-Pina et al. 2023 [R16] (located) | No clinical claims; adult ADHD rules below are hypotheses; founder usability tests are decisive |
| 12 | Duolingo streak freeze/repair, XP leagues, mistake-review loops drive retention | Duolingo users | **Product-company-reported** (no independent adult-ADHD data) | Company engineering/design posts; not independently re-verified this session | Steal *mistakes-review* and *immediate feedback*; reject streak-loss punishment |

## Adult ADHD design hypotheses (NOT established findings — treat as testable priors)

These come from clinical knowledge of adult ADHD executive function (task initiation, delay aversion, time blindness, interest-driven attention, shame/rejection sensitivity) applied as design priors. None have product-level RCT backing for this use case.

1. **Initiation beats motivation:** the first interaction must cost near-zero and pay off in seconds. → beat 1 is one tap that visibly changes state.
2. **Choice budget:** working-memory and decision-fatigue priors → ≤3 options per beat, one focal action per screen.
3. **Time invisibility:** time blindness priors → visible beat pips + "~3 min" expectations, never countdowns.
4. **Interruption is the default:** phone rings, hyperfocus breaks → exact-beat resume is a correctness feature, not a nicety.
5. **Shame kills return:** punitive streaks, lost lives, red-flash errors trigger abandonment and avoidance → fail-soft retry only; progress never lost; no streak counter.
6. **Interest > importance:** relevance to the founder's own project sustains attention → every scenario is a real business decision, never trivia.

## Bounce risks (top 5 interaction patterns that lose this ICP)

1. **Text walls / passive reading** — no interaction in the first 30 seconds = tab closed.
2. **Spinner-first or latency-dependent core loop** (v1's AI-chat lesson failure mode) — wait + no agency = bounce.
3. **Punishment or loss states** (streak breaks, lives, lockouts) — one shame hit and the product is "not for me" forever.
4. **Choice paralysis on entry** (8 regions, 48 landmarks, "where do I start?") — needs a default first move, not a menu.
5. **No visible finish line** — unbounded content with no per-unit completion = no completion.

## Mechanics worth stealing vs avoiding (cross-product patterns)

**Steal:** immediate per-action feedback (all products) · forced-attempt-before-answer (Brilliant, prequestion science) · mistake review loop (Duolingo) · one-tap next-unit offer (all) · visible unit completion ritual (Duolingo, Drops) · deterministic grading with instant explanation (Brilliant, DataCamp) · progressive disclosure of multi-step content (Brilliant) · calm reference surface beside the interactive one (Khan).

**Avoid:** lives/energy systems · streak-loss punishment · leaderboards for a shame-sensitive ICP · randomized reward that decouples prize from competence · infinite scroll · mandatory typing before value · blocking AI "thinking" states · novelty motion that outshouts the content.

## What this changes in the contract (banked corrections — applied in v1.3 freeze)

Stable per-beat `id` · quiz/check dedup (`quiz_completed` once; direct quiz never stamps) · onboarding note corrected to route-scoped display (OnboardingChat lives in MapExperience, not the landmark page — no behavior change) · pilot reward scope = stamp + pips + next-offer only · server-atomic monotonic SQL upsert with content-registry ID validation · `state.completed === true` preserved (share contract) · scenario copy loyalty to canonical fields · connectivity claim scoped to interaction+grading · `lesson` URL value preserved ("Play" is display copy) · time targets explicitly hypotheses · claims map now points here.

## The honest gap, stated plainly

Adult-ADHD-specific evidence for gamified learning products does not meaningfully exist in the literature as of 2026-07-19. The contract's ADHD rules are defensible hypotheses built from strong adjacent evidence. The 5–8 founder usability study (post-pilot) is not a nice-to-have — it is the only evidence layer that can actually validate this product shape for this ICP.

## Bibliography (all links located 2026-07-19)

- [R1] Dunlosky, Rawson, Marsh, Nathan, Willingham (2013). Improving Students' Learning With Effective Learning Techniques. *Psychological Science in the Public Interest*. https://pubmed.ncbi.nlm.nih.gov/26173288/
- [R2] Pan & Carpenter (2023). Prequestioning and Pretesting Effects: a Review of Empirical Research. *Educational Psychology Review* 35:97. https://link.springer.com/article/10.1007/s10648-023-09814-5 (open access)
- [R3] St Hilaire et al. (2024). A Meta-Analytic Review of the Prequestion Effect. https://dr.lib.iastate.edu/bitstreams/fd171cce-44af-4060-a983-c6f0e496e1da/download
- [R4] Sweller, worked-example effect (canonical cognitive-load literature; see Chen et al. 2023 for a current review).
- [R5] Chen et al. (2023). The effect of worked examples on learning solution steps and schema acquisition. *Educational Psychology*. https://www.tandfonline.com/doi/full/10.1080/01443410.2023.2273762
- [R6] van Gog et al. (2011). Effects of worked examples, example-problem, and problem-example pairs. *Contemporary Educational Psychology*. https://www.sciencedirect.com/science/article/abs/pii/S0361476X1000055X
- [R7] Nunes & Drèze (2006). The Endowed Progress Effect: How Artificial Advancement Increases Effort. *Journal of Consumer Research*. https://www.researchgate.net/publication/23547282
- [R8] Kivetz, Urminsky & Zheng (2006). The Goal-Gradient Hypothesis Resurrected. *Journal of Marketing Research*. https://home.uchicago.edu/ourminsky/Goal-Gradient_Illusionary_Goal_Progress.pdf
- [R9] Ryan & Deci (2000). Self-Determination Theory and the Facilitation of Intrinsic Motivation. *American Psychologist*. https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf
- [R10] Kapur (2008). Productive Failure. *Cognition and Instruction* 26(3):379–424. https://www.tandfonline.com/doi/abs/10.1080/07370000802212669
- [R11] Kestin et al. (2025). AI tutoring outperforms in-class active learning: an RCT. *Nature Scientific Reports*. https://www.nature.com/articles/s41598-025-97652-6
- [R12] open-spaced-repetition/srs-benchmark (GitHub). https://github.com/open-spaced-repetition/srs-benchmark and https://expertium.github.io/Benchmark.html
- [R13] W3C WCAG 2.2, SC 2.2.2 Pause, Stop, Hide (Level A). https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
- [R14] W3C WCAG 2.2, SC 2.3.3 Animation from Interactions (AAA). https://www.w3.org/TR/WCAG22/#animation-from-interactions (plain-English: https://aaardvarkaccessibility.com/wcag-plain-english/2-3-3-animation-from-interactions/)
- [R15] Gabarron et al. (2025). Evaluating the evidence: a systematic review of reviews on digital interventions for ADHD. *BMC Psychiatry*. https://pmc.ncbi.nlm.nih.gov/articles/PMC12016436/
- [R16] Caselles-Pina et al. (2023). Adherence, frequency, and long-term follow-up of video games-based interventions for ADHD. https://pmc.ncbi.nlm.nih.gov/articles/PMC10636395/
