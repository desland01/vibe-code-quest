# Landscape and gap — who teaches dev terrain to non-coders, as of 2026-08

Researched 2026-08-03. Answers ticket
[`.scratch/terrain-course-design/issues/02-landscape-and-gap.md`](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/02-landscape-and-gap.md).

Every number below carries the API that produced it and the date it was pulled. All
volumes are **United States, monthly, English** unless stated.

---

## 0. Method note — every API call made

| # | API | Call | Returned data? |
|---|---|---|---|
| 1 | DataForSEO `kw_data_google_ads_search_volume` | 14 terrain keywords (`what is a database`, `what is hosting`, …) | Yes — 9 items returned, 5 silently dropped |
| 2 | DataForSEO `kw_data_google_ads_search_volume` | 14 agent-survival keywords (`claude code always allow`, …) | Yes — 10 items |
| 3 | Perplexity `perplexity_research` | Full landscape synthesis, 2026-08 state + 2025/26 new entrants | Yes — ~420 citations |
| 4 | Firecrawl `firecrawl_scrape` | `https://roadmap.sh/pricing` | Yes — **404**, page does not exist (pricing lives at `/premium`) |
| 5 | Firecrawl `firecrawl_scrape` | `https://www.boot.dev/pricing` | Yes — live pricing + student count |
| 6 | Firecrawl `firecrawl_scrape` | `https://roadmap.sh/premium` | Yes — live pricing + platform stats |
| 7 | Firecrawl `firecrawl_scrape` | `https://scrimba.com/pricing` | Yes — live pricing |
| 8 | Firecrawl `firecrawl_scrape` | `https://brilliant.org/premium/` | Yes — live pricing |
| 9 | Ahrefs `site-explorer-metrics` | roadmap.sh / boot.dev / brilliant.org | **No — `Insufficient plan`** |
| 10 | Ahrefs `site-explorer-metrics` | roadmap.sh, retry without country | **No — `Insufficient plan`** (retried once as required) |
| 11 | Ahrefs `keywords-explorer-overview` | 5 keywords | **No — `Insufficient plan`** |
| 12 | Semrush `semrush_domain_organic` | roadmap.sh top organic pages | Yes |
| 13 | Semrush `overview_research` → `get_report_schema` → `execute_report` (`domain_rank`) | 6 incumbents + 3 new entrants, `database=us` | Yes — 9 calls, all returned |
| 14 | DataForSEO `dataforseo_labs_google_keyword_suggestions` | `claude code` seed, SV > 100, top 40 | Yes |
| 15 | DataForSEO `kw_data_google_ads_search_volume` | 15 more terrain keywords | Yes — 10 items |
| 16 | DataForSEO `kw_data_google_ads_search_volume` | 15 more agent keywords | Yes — 10 items |
| 17 | DataForSEO `kw_data_google_ads_search_volume` | 9 terrain keywords dropped from batch 1/15 | Yes — 9 items |
| 18 | DataForSEO `kw_data_google_ads_search_volume` | 9 agent keywords dropped from batch 2/16 | Yes — 9 items |

**Failures and how they were handled.** The Ahrefs MCP returned `Insufficient plan`
on every Site Explorer and Keywords Explorer call, including the required retry. That
is a subscription scope limit, not an outage. Traction was therefore sourced from
**Semrush `domain_rank`**, which the ticket names as an acceptable substitute for
Ahrefs on the same question. No free WebSearch was used anywhere in this document.

**One measurement caveat, stated up front.** DataForSEO's Google Ads volume endpoint
caps each batch near 10 keywords and drops the overflow *silently*. That was caught
after batch 1 and the dropped terms were re-run in calls 17–18. Terms listed below as
"no volume returned" were genuinely returned empty by the API, not dropped.

---

## 1. Competitor table, as of 2026-08

Traction column: Semrush `domain_rank`, `database=us`, pulled 2026-08-03. "Organic
traffic" is Semrush's estimated monthly US organic sessions.

| Product | Subject | Format(s) it chose | Price | Traction (Semrush US organic, 2026-08-03) | Source |
|---|---|---|---|---|---|
| **roadmap.sh** | Developer career paths, and since ~2025 an AI learning suite | **Six-plus, generated per user**: static visual roadmap, AI-generated course, deep-dive guide, quiz/interview prep, learning plan, contextual chat tutor, plus hand-authored lesson packs with projects | Free tier (one-time: 20 chats, 2 courses, 5 lessons, 2 quizzes). **Pro $8.33/mo billed yearly = $100/yr**, or $10/mo. Team $10/seat/mo, min 3 seats | **80,948** organic traffic, 9,332 organic keywords, rank 26,798. Site claims **2.8M active learners, 160K+ roadmaps created, 150K+ courses generated, 1M+ AI conversations**, "18K+ developers" on Pro | [roadmap.sh/premium](https://roadmap.sh/premium) |
| **freeCodeCamp** | Full-stack web dev, certifications | Multiple but **fixed**: workshops, lectures, labs, review pages, quizzes, exams, projects (Full Stack path = 64 workshops / 513 lectures / 83 labs / 62 review pages / 66 quizzes) | **Free**, including certifications | **559,573** organic traffic, 416,632 organic keywords, rank 4,294 — largest by a wide margin | [freecodecamp.org/news](https://www.freecodecamp.org/news/freecodecamp-turns-10-major-curriculum-updates/) |
| **Brilliant** | Math, science, CS, AI — conceptual | **Interactive lesson + puzzle/quiz**, plus the Koji AI tutor. No video, minimal IDE work | Free: first 2 levels/course, 2 lessons/day. **$30/mo, $20/mo annual, $40/mo family (6 seats)** | **205,170** organic traffic, 114,996 organic keywords, rank 11,074. Also buys ads: 414 paid keywords, $13,405/mo ad spend | [brilliant.org/premium](https://brilliant.org/premium/) |
| **Boot.dev** | Backend engineering (Python, Go, SQL, TS) | **Multiple, fixed sequence**: written lesson, explainer video, quiz, code submission, projects, "Boots" Socratic AI tutor; plus adaptive **Training Grounds** practice (2025) | Free/read-only after first chapters. **$59/mo or $399/yr** | **41,357** organic traffic, 9,348 organic keywords, rank 49,757. Pricing page states **1,201,282 students**, 6,444 reviews | [boot.dev/pricing](https://www.boot.dev/pricing) |
| **Scrimba** | Frontend / fullstack / AI engineering | **One signature format**: the interactive screencast ("scrim") — pause the video and edit the instructor's live code. Plus AI "Instant Feedback" on challenges | ~25 courses free. **Pro $49/mo, or $24.50/mo billed annually at $294/yr** | **19,663** organic traffic, 3,818 organic keywords, rank 98,839 | [scrimba.com/pricing](https://scrimba.com/pricing) |
| **Exercism** | 8,500+ exercises across 83 languages | **One format**: CLI-first coding exercises + human mentoring. No quiz, no video, no AI tutor | **Free forever**, incl. mentoring. Insiders at $10+/mo donation or $499 lifetime | **15,300** organic traffic, 3,729 organic keywords, rank 123,808 | [exercism.org](https://exercism.org/) |

### Built since 2025, aimed at people who ship with AI agents

| Product | Subject | Format | Price | Traction | Source |
|---|---|---|---|---|---|
| **Anthropic Academy** (Claude Code in Action, Claude 101) | Official Claude Code training: safe edits, plan mode, context, hooks, MCP, SDK | Self-paced video + text, Skilljar LMS | **Free** | Launched **2026-03-02** with ~13 courses, ~22 by mid-2026. Claude Code in Action = 21 lessons | [anthropic.com/learn](https://www.anthropic.com/learn) |
| **Claude Code for Everyone** | Claude Code for people with **no coding or terminal experience** | Runs *inside Claude Code* — the agent teaches you itself | **Free** | Launched **2026-01-08**. GitHub repo 538 stars. Predecessor "Claude Code for PMs" completed by 2,000+ PMs. Domain `ccforeveryone.com`: **847** organic traffic, 363 keywords, rank 1,216,106 | [ccforeveryone.com](https://ccforeveryone.com/) |
| **DeepLearning.AI — Spec-Driven Development with Coding Agents** | Explicitly anti-vibe-coding: spec as source of truth | Video + labs | Free during platform beta | Launched **2026-04-15** | [deeplearning.ai](https://www.deeplearning.ai/courses/spec-driven-development-with-coding-agents) |
| **DeepLearning.AI — Vibe Coding 101 / Claude Code** | Building and debugging with Replit and Claude Code agents | Video + labs | Free during beta | **2025-03-26** and **2025-08-06**. Platform reported 1.2M enrollments across 2025 | [deeplearning.ai](https://www.deeplearning.ai/courses/vibe-coding-101-with-replit) |
| **Vibecademy** | **Certification: implement specs with agents, then review and defend the diffs** | Course + human-reviewed final project | **$49/mo or $299 lifetime** | Launch campaign **week of 2026-05-18**. `vibecademy.ai`: **9** organic traffic, 16 keywords, rank 8,302,523 — effectively no search presence | [vibecademy.ai/pricing](https://www.vibecademy.ai/pricing) |
| **Vibe Coding Academy** (Boiteux) | PM/non-engineer curriculum + live Claude Code cohorts | Tutorials, Slack, live cohorts | ~$19/mo, $299 Master Course; **Claude Code for PMs cohort $469/seat** | Launched **2025-06-24**, claims 1,300+ community. `vibecodingacademy.ai`: **592** organic traffic, 837 keywords, rank 1,518,983 | [vibecodingacademy.ai](https://www.vibecodingacademy.ai/) |
| **LinkedIn Learning — Vibe Coding from Scratch** | PRD → blueprint → TDD → refactor → code review → security audit → deploy | Video course | ~$39.99/mo subscription | **2026-04-27**. Instructor reports 4,163+ learners by 2026-07 | [linkedin.com/learning](https://www.linkedin.com/learning/vibe-coding-from-scratch-a-beginner-s-guide-to-building-and-shipping-an-app-with-ai) |
| **Codecademy — Intro to Vibe Coding** | What vibe coding is, tool choice, first app | 2 lessons, 2 quizzes, 1 project, 1 hour | **Free** | Live by **2025-08-19** | [codecademy.com](https://www.codecademy.com/learn/intro-to-vibe-coding) |
| **Scanner wave** — VibeScan, SecureVibe, Vibe App Scanner, ScanMyVibe, VibeLegit | Scan a vibe-coded app, return plain-English findings + agent-ready fix prompts | Tool, not a course | Free → $13–99/mo; VAS $19 one-time deep scan | VibeScan founder reported **4 sales / ~$300 MRR**. VAS reported **450 scans** since Dec 2025. ScanMyVibe claims 2,100+ teams (self-reported) | [vibeappscanner.com/pricing](https://vibeappscanner.com/pricing) |

---

## 2. The format claim — verified per competitor

The 2026-05-03 design's EUREKA was: *"This is the actual differentiator vs roadmap.sh
/ Brilliant / Boot.dev — they all chose ONE format. We can choose all three per user."*

**Verdict: the claim was true in May 2025 and is false in August 2026. roadmap.sh
shipped it.**

| Competitor | One format only? | Evidence |
|---|---|---|
| **roadmap.sh** | **REFUTED — decisively.** Not only multiple formats, but *generated per user from the same topic at the same skill level*. Its own pricing page sells exactly this: "Generate courses, guides, structured roadmaps, quizzes, instant answers, and get a personal coach — all tailored to your skill level." Quizzes can be multiple-choice, open-ended, or mixed | [roadmap.sh/premium](https://roadmap.sh/premium), scraped 2026-08-03 |
| **Boot.dev** | **PARTIALLY REFUTED.** Every lesson already ships as written text + video + quiz + code submission, and Training Grounds (2025) adaptively *generates* practice from the learner's history. But the lesson itself is not re-rendered into alternative media per user | [boot.dev/training](https://www.boot.dev/training) |
| **freeCodeCamp** | **PARTIALLY REFUTED on breadth, upheld on adaptivity.** The 2025 curriculum rebuild has workshops, lectures, labs, quizzes, exams and review pages — very broad format coverage, but identical for every learner. No personalization | [freecodecamp.org/news](https://www.freecodecamp.org/news/freecodecamp-turns-10-major-curriculum-updates/) |
| **Brilliant** | **UPHELD, with an asterisk.** Core format is one thing: the interactive puzzle-lesson. The Koji AI tutor adapts its questioning within that lesson, and Premium includes "personalized practice" — but Brilliant does not re-render a topic as video vs reading vs roadmap | [brilliant.org/premium](https://brilliant.org/premium/) |
| **Scrimba** | **UPHELD.** One signature format, the editable screencast. Everything else is authored around it | [scrimba.com/pricing](https://scrimba.com/pricing) |
| **Exercism** | **UPHELD.** One format: coding exercises with human mentoring. No quiz, no video, no AI tutor in the standard product | [exercism.org](https://exercism.org/) |

**What this means for the project.** The "adaptive multi-format rendering" premise is
no longer a differentiator — it is roadmap.sh's shipped product, at $100/yr, in front
of a claimed 2.8M learners. Anything built on that premise is now a me-too against an
incumbent with 80,948 monthly organic sessions and a two-year head start on the
feature. The *user-model-as-moat* framing survives only if the model does something
roadmap.sh's skill-level slider does not.

---

## 3. Demand data

### Scope (a) — navigation over the dev terrain for non-coders

Source: **DataForSEO `kw_data_google_ads_search_volume`**, US, en, pulled **2026-08-03**.

| Keyword | US monthly volume | 12-mo trend (2025-07 → 2026-06) |
|---|---|---|
| what is an api | **40,500** | 40,500 → 40,500 (flat) |
| what is devops | 8,100 | 9,900 → 8,100 (−18%) |
| what is git | 8,100 | 8,100 → 9,900 (+22%) |
| what is a server | 8,100 | 8,100 → 6,600 (−19%) |
| what is a database | 6,600 | 4,400 → 3,600 (−18%) |
| how does the internet work | 4,400 | 3,600 → 2,900 (−19%) |
| how to learn to code | 3,600 | 720 → 720 (flat, spiky) |
| what is a rest api | 3,600 | 3,600 → 3,600 (flat) |
| sql vs nosql | 2,400 | 2,900 → 1,900 (−34%) |
| what is an api call | 1,600 | 1,600 → 1,600 (flat) |
| what is hosting | 880 | 720 → 720 (flat) |
| what is a framework in programming | 720 | 880 → 590 (−33%) |
| frontend vs backend | 590 | 720 → 480 (−33%) |
| database types explained | 480 | 170 → 110 |
| what is cloud hosting | 260 | 390 → 170 (−56%) |
| developer roadmap | 260 | 390 → 210 (−46%) |
| learn programming basics | 170 | 390 → 90 (−77%) |
| computer science for beginners | 140 | 170 → 110 |
| web development for beginners | 140 | 170 → 70 |
| no code vs low code | 70 | 70 → 20 |
| what database should i use | **20** | 20 → 20 |
| learn coding concepts without coding | **no volume returned** | — |
| learn dev concepts | **no volume returned** | — |
| non technical founder learn tech | **no volume returned** | — |
| tech concepts for non technical | **no volume returned** | — |
| learn tech basics | **no volume returned** | — |
| learn to code without coding | **no volume returned** | — |
| tech literacy course | **no volume returned** | — |
| developer roadmap 2026 | **no volume returned** | — |

**Scope (a) measured total: ~90,730/mo across 21 terms with volume.**

Two things this table says that the headline number hides:

1. **The volume is in "what is X" definitional lookups, not in course intent.** A
   single term, `what is an api`, is 45% of the whole scope. Those searches are
   answered by one paragraph and an AI Overview — they are not people shopping for a
   navigation course.
2. **Every term describing the actual product concept returns zero.** "learn dev
   concepts", "tech concepts for non technical", "learn coding concepts without
   coding", "non technical founder learn tech" — all no volume. And the single most
   on-thesis query in the original design, **`what database should i use`, is 20
   searches/month** and has been flat at 10–30 for the full 12 months.
3. **The trend is down.** Of the 21 terms, 11 declined year over year, 6 were flat,
   and only 1 (`what is git`) grew meaningfully.

### Scope (b) — understanding / surviving what an AI agent proposes

Source: **DataForSEO `kw_data_google_ads_search_volume`**, US, en, pulled **2026-08-03**.

**b1 — the specific "survive the agent" intent:**

| Keyword | US monthly volume | 2025-07 | 2026-06 | Growth |
|---|---|---|---|---|
| claude code hooks | **3,600** | 6,600 | 3,600 | −45% (peaked 6,600 Mar-26) |
| claude code security | **2,900** | 170 | 880 | **+418%** (spiked to 22,200 in Feb-26) |
| claude code best practices | 1,900 | 2,900 | 1,300 | −55% |
| claude code dangerously skip permissions | **1,600** | 880 | 1,300 | **+48%** (peaked 3,600 Mar-26) |
| claude code sandbox | 880 | 170 | 880 | **+418%** |
| claude code permissions | 720 | 390 | 590 | **+51%** (peaked 1,600 Mar-26) |
| claude code settings json | 590 | 320 | 480 | +50% |
| cursor yolo mode | 170 | 480 | 70 | −85% |
| vibe coding security | 90 | 110 | 90 | −18% |
| **claude code always allow** | **70** | **20** | **140** | **+600%** |
| vibe coding risks | 40 | 30 | 50 | +67% |
| ai agent safety | 30 | 20 | 20 | flat |
| review ai generated code | 10 | — | 30 | new, CPC **$45.22** |
| vibe coding mistakes | 10 | — | 10 | flat |
| ai agent deleted my database | **no volume returned** | | | |
| is it safe to let ai run commands | **no volume returned** | | | |
| ai coding agent security | **no volume returned** | | | |
| understand ai generated code | **no volume returned** | | | |

**b1 measured total: ~12,610/mo across 14 terms with volume.**

**b2 — learning to work with the agent (adjacent, larger):**

| Keyword | US monthly volume | 2025-07 | 2026-06 | Growth |
|---|---|---|---|---|
| what is claude code | 12,100 | — | — | (DataForSEO Labs suggestions, 2026-08-03) |
| how to use claude code | 6,600 | — | — | same |
| claude code tutorial | 2,900 | 1,600 | 2,400 | +50% |
| how to vibe code | 1,600 | 1,300 | 1,300 | flat |
| **learn claude code** | 1,600 | **70** | **1,900** | **+2,614%** |
| claude code course | 1,600 | 210 | 1,600 | **+662%** |
| claude code for beginners | 480 | 70 | 590 | **+743%** |
| vibe coding course | 480 | 390 | 320 | −18% |
| vibe coding for beginners | 110 | 110 | 110 | flat |

**b2 measured total: ~27,470/mo.**

**Head terms for context:** `vibe coding` **110,000/mo** (CPC $15.00, MEDIUM
competition, peaked 165,000 in Mar-26); `claude code` **550,000/mo**
(DataForSEO Labs keyword suggestions, 2026-08-03).

**Spend signal.** Scope (b) carries far higher commercial value per search than scope
(a). `review ai generated code` CPC **$45.22**; `cursor yolo mode` **$39.92**;
`vibe coding security` **$26.66**; `claude code sandbox` **$20.98**; `vibe coding`
**$15.00**. Compare scope (a): `what is a database` $5.32, `what is an api` $4.15,
`sql vs nosql` $0.18. Advertisers are paying 5–250x more per click to reach someone
worried about what their agent just did than to reach someone asking what a database
is.

---

## 4. The gap

**Scope (b) is materially less occupied. The margin is roughly 600x in occupancy
against roughly 7x in demand.**

### Occupancy, measured

| Scope | Incumbents | Combined Semrush US organic traffic (2026-08-03) |
|---|---|---|
| **(a) dev terrain for non-coders** | freeCodeCamp 559,573 + Brilliant 205,170 + roadmap.sh 80,948 + Boot.dev 41,357 + Scrimba 19,663 + Exercism 15,300 | **922,011/mo** |
| **(b) surviving the agent** | ccforeveryone.com 847 + vibecodingacademy.ai 592 + vibecademy.ai 9 | **1,448/mo** |

### Demand, measured

| Scope | Measured monthly US volume | Direction |
|---|---|---|
| (a) | ~90,730 | Declining — 11 of 21 terms down YoY, 1 up |
| (b1) survive-the-agent | ~12,610 | Growing hard — `claude code always allow` +600%, `claude code security` +418%, `claude code sandbox` +418% |
| (b2) learn-the-agent | ~27,470 | Growing hardest — `learn claude code` +2,614%, `claude code for beginners` +743% |
| (b1+b2) | ~40,080 | |

**The ratio that matters:** scope (a) has **2.3x** the search demand of scope (b) but
**637x** the incumbent organic footprint. Per unit of demand, scope (a) is roughly
**280x more contested**.

### Four qualifications, so this isn't oversold

1. **Scope (b)'s demand is small in absolute terms and attached to one vendor.**
   ~12,610/mo for b1 is a niche, and most of it is literally the string "claude code".
   That demand is a rental on Anthropic's product naming. If the tool loses share the
   keyword set evaporates. Scope (a)'s vocabulary (`what is a database`) is permanent.

2. **Scope (b) is occupied by free official training that these SEO numbers do not
   capture.** Anthropic Academy (launched 2026-03-02, ~22 courses, free) and
   DeepLearning.AI's four relevant courses (free during beta) sit on
   `anthropic.skilljar.com` and `deeplearning.ai`, so they do not appear in the 1,448
   figure. The honest statement is: **scope (b) is empty of paid, indexed,
   independent products, but well-served by free first-party courses.** Competing on
   "teach me to use Claude Code" means competing with Anthropic, for free.

3. **The unoccupied slice is narrower than "scope (b)".** What nobody has built —
   confirmed by Perplexity synthesis across ~420 sources — is *comprehension
   verification*: converting a proposed agent change into a plain-English explanation
   plus a check that the non-coding owner actually understood the consequences before
   approving. The scanners (VibeScan, VAS, ScanMyVibe) find problems but never test
   understanding. The courses (Anthropic Academy, DeepLearning.AI, LinkedIn) teach
   workflow but never look at *your* diff. **Vibecademy is the only product testing
   "can you review and defend a diff", it launched 2026-05-18, and it has 9 monthly
   organic visitors.** That is the actual hole.

4. **The original differentiator is gone and should not be re-argued.** roadmap.sh
   ships per-user multi-format generation today at $100/yr. Section 2 documents it.

### Plain read

There is a gap, it is in scope (b), and it is narrower and more specific than the
ticket's framing: **not "understanding AI agents" as a subject, but verifying that a
person who cannot read code actually understood a specific change before approving
it.** Scope (a) is a large, declining, thoroughly-owned market where the intended
differentiator has already been shipped by the incumbent. Scope (b1) is small, is
growing 5–7x year over year, commands 5–250x the CPC, and its only three independent
paid entrants have a combined 1,448 monthly organic visits between them.

The risk in scope (b) is not competition. It is that the demand is small, is
vendor-coupled, and has a free first-party alternative one search away.

---

## 5. Numbers most likely to be load-bearing for ticket 04

- `what database should i use` — **20/mo**, flat 12 months. The design's flagship
  question is not a market.
- `claude code always allow` — **70/mo now, 20 → 140 over 12 months (+600%)**.
- Scope (a) incumbent footprint **922,011/mo** vs scope (b) **1,448/mo**.
- roadmap.sh Pro is **$100/yr** and already does per-user multi-format generation.
- `vibe coding` head term **110,000/mo at $15.00 CPC**.
- `review ai generated code` — 10/mo but **$45.22 CPC** and HIGH competition:
  advertisers believe in this intent well ahead of the search volume.
