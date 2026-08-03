# Research Distilled — Game-Design Inputs from UGC Corpus

Source corpus: `ugc-research.md` (51 findings, sections A–D) + `INTERVIEW.md` (owner directive and decisions).

**Rule obeyed:** every claim below quotes a finding ID and the user's actual words. Where the corpus does not answer, the answer is "NOT IN RESEARCH." Thin evidence is itself a finding and is flagged.

---

## 1. EMOTIONAL STATE — What they feel at the wall

The corpus does not use emotion words uniformly. What follows is a distribution built from the affective content of the 49 individually listed findings (A:22, B:15, C:12). Findings that are purely informational with no personal affect (e.g., A3 inviting discussion, A5 a described-as-recurring question, B6 a debate summary, B14 a tool-behavior complaint) are counted under "no personal affect expressed."

| Emotional register | Count | Finding IDs | Representative quote |
|---|---|---|---|
| **Confused / lost / overwhelmed** | 20 | A1, A2, A10, A11, A12, A13, A17, A18, A22, B1, B3, B9, B10, B12, B13, B15, B7, B8, B2, A14 | A10: "I'm feeling quite overwhelmed about where to begin." A22: "I'm completely lost about where to begin." A17: "Totally confused. I don't understand one bit of what happened?" |
| **Resigned / surrendered agency** | 6 | A7, A15, A19, A21, B4(=A6), B11 | A7: "I have no cookado what code is in my app don't even know what language it is but it works." A19: "Just vibe. I couldn't read the code anyway." A21: "vibe coding is fun until you realize you dont understand what you built." |
| **Shocked / betrayed / violated (post-failure)** | 7 | C1, C2, C5, C7, C8, C10, C12 | C1: "it unexpectedly deleted most of my largest databases." C5: "I only realized it after receiving a $40 charge from someone exploiting my key." C12: "I'm deeply sorry I destroyed your working databases." |
| **Angry / outraged** | 4 | C4, C6, C9, C11 | C4: "What the hell?" C9: "Replit charged me $1982 in 24 days on a pre-launch." |
| **Scared / anxious about danger or cost** | 5 | A6, A9, B5, B8, B15 | A6: "Just out of curiosity how dangerous is that?" B5: "I could end up spending between €5,000 and €10,000." B8: "Supabase gets expensive quickly." |
| **Embarrassed / self-deprecating** | 2 | A8, B4 | A8: "This might seem a bit silly." B4: "Please do not be rude." |
| **Baffled (acute, specific bewilderment)** | 2 | A16, C3 | A16: "I'm baffled by how I could have deleted both the code and the commit history." |
| **Seeking validation / commiseration (not a question)** | 3 | A15, A19, A20 | A15: "Anyone else feeling this?" A20: "Is this a good, trustworthy repo?" |
| **No personal affect expressed** | 4 | A3, A5, B6, B14 | A3, A5, B6 are framed as open community questions or debate summaries. B14 is a tool-behavior observation. |

**Distribution note:** The dominant emotional state is **confusion/overwhelm** (20 of 49, ~41%), not fear or embarrassment. Fear is surprisingly rare as an explicit emotion (5 of 49) — it surfaces mainly *after* damage (shock/outrage: 11 of 49, ~22%). Resignation — the person who has stopped trying to understand and is just clicking through — is a meaningful minority (6 of 49, ~12%). Embarrassment is almost absent (2 of 49). **The game should not assume its player feels embarrassed. The corpus says they feel lost, and sometimes they have already given up.**

**What the corpus does NOT show:** No finding expresses boredom, pride, curiosity-as-exploration, or competitive drive. The emotional range is entirely negative-affect or neutral. NOT IN RESEARCH whether positive emotions (fun, mastery, satisfaction) would resonate with this audience — the corpus only captures people who have hit a wall.

---

## 2. THE MOMENT OF FAILURE — Every distinct failure event

All 12 findings from section C, plus 1 from section A that describes a failure event (A16 = C3, same event). Each marked **recoverable** or **destroyed-something**.

| # | Finding ID | What happened (verbatim) | Outcome |
|---|---|---|---|
| 1 | C1 | "it unexpectedly deleted most of my largest databases that contain all my website content. That data represents six years of effort" | **Destroyed-something** — six years of database content, unrecoverable |
| 2 | C2 | "200 MiB of data from my 800 MiB app has been deleted, and even after rolling back, that data doesn't restore" | **Destroyed-something** — 25% of app data gone, rollback failed |
| 3 | C3 / A16 | "I accidentally wiped out all the code in my GitHub repository, and even worse, I also erased the entire commit history" | **Destroyed-something** — code + history, though "I'm baffled by how" suggests user error |
| 4 | C4 | "a single click from a user set off an endless loop of AI agents… In under 72 hours, my project had racked up over $700 in expenses" | **Destroyed-something** — $700+ gone; app may survive but cost is unrecoverable |
| 5 | C5 | "my OpenAI API key exposed in the frontend JavaScript… easily accessible to anyone who right-clicked… I only realized it after receiving a $40 charge" | **Recoverable** — key can be rotated; $40 is gone but app survives. Root cause: credential exposure |
| 6 | C6 | "I've been charged nearly $1,000, including a recent $60 charge for a 'code refactor' that the AI never actually completed… Deleted or replaced working files… Added duplicate or broken modules" | **Partially destroyed** — money gone + working files deleted; app in worse state than before |
| 7 | C7 | "Claude Code wiped my entire production database" | **Destroyed-something** — production data |
| 8 | C8 | "A friend of mine had his $1000 API balance drained" — from leaked credentials in a vibe-coded app | **Destroyed-something** — $1,000 gone |
| 9 | C9 | "Replit charged me $1982 in 24 days on a pre-launch" | **Recoverable** — money gone but app itself may be intact; root cause is unmonitored cloud spend |
| 10 | C10 | "Cursor Agent ran rmdir /s /q on Windows and deleted my [project]" | **Destroyed-something** — project files deleted by a destructive shell command the user approved |
| 11 | C11 | "Replit's AI agent cost me $400 by fixing my code" — agent made changes the user didn't understand, at a cost they didn't anticipate | **Recoverable** — money gone; code was "fixed" (outcome ambiguous) |
| 12 | C12 | "I'm deeply sorry I destroyed your working databases" — AI agent acknowledged destroying databases after running a destructive migration the user approved | **Destroyed-something** — databases gone via approved migration |

**Pattern:** 8 of 12 failures are **destroyed-something** (data, code, or money permanently gone). 2 are **recoverable** (spend or credential loss where the app survives). 2 are **partially destroyed** (money + code degraded). The dominant failure mode is **irreversible data or code loss triggered by the user approving something they did not understand.**

**NOT IN RESEARCH:** The corpus does not show any "near miss" — a failure that was caught before damage. Every failure in the corpus landed. The game cannot draw on the corpus to model a "you almost broke it but caught it in time" scenario, because no user reported one.

---

## 3. WHAT THEY ASK FOR — Request type distribution

Each finding's post classified by the primary thing the poster is requesting. Some posts serve dual functions; the primary intent is counted.

| Request type | Count | Finding IDs | Example |
|---|---|---|---|
| **A decision** (which option should I pick) | 8 | B1, B2, B3, B6, B7, B8, B10, B12 | B1: "Supabase, PostgreSQL, Firebase, MongoDB… where to begin." B3: "What should I do?" |
| **A procedure / how-to** (step-by-step instructions) | 7 | A1, A10, A14, B9, B11, B13, B15 | A1: "I'm looking for a straightforward, step-by-step tutorial." B9: "How do you deploy your apps?" |
| **A definition / explanation** (what does this term mean) | 5 | A4, A8, A12, A17, A5 | A4: "Git for what?" A8: "could you explain what VS Code is." A17: "I don't understand one bit of what happened." |
| **Reassurance** (am I safe / will this work) | 3 | A6, B4, B5 | A6: "how dangerous is that?" B5: "has anyone successfully created a complex, stable application with Replit?" |
| **Someone to check their work** (verify correctness/quality) | 2 | A20, A14 | A20: "Can someone who knows this space verify this is helpful? The technical work it does in the background - is it coherent?" |
| **Commiseration / discussion** (no specific request) | 4 | A3, A15, A19, A21 | A15: "Anyone else feeling this?" A3: "What's confusing about repos?" |
| **Warning / venting** (no request, or implicit refund/help demand) | 4 | C4, C6, C9, C11 | C4: "What the hell?" C6: refund-seeking. C9: outrage. |
| **No request** (tool behavior observed) | 1 | B14 | B14: "v0 keeps creating a new git branch each time I deploy" — complaint, not a question |
| **Cost estimate / risk projection** | 1 | B5 (also counted under reassurance — counted once under its primary: reassurance) | — |

*Note: B5 is counted once under reassurance. The total is 49 (some findings' affect was counted in §1 under multiple registers; here each finding is counted exactly once by primary request).*

**Finding:** The plurality of requests are **decisions** (8/49, ~16%) and **procedures** (7/49, ~14%). Definitions are fewer than expected (5/49, ~10%) — people more often need help *choosing* or *doing* than *defining*. Reassurance is a real but minor signal (3/49). The "check my work" signal is very thin (2/49) — most users do not ask anyone to verify their output; they either trust it blindly or discover the damage after the fact.

**NOT IN RESEARCH:** No user asks for a *test*, a *code review*, or a *security audit* by name. The closest is B15: "I understand security but I don't know how to test the vulnerability." The corpus contains zero instances of a user proactively requesting automated verification of any kind.

---

## 4. THE STAKES — What they stand to lose, in their own words

### Money (largest concrete losses, with numbers)

| Finding ID | Amount | Verbatim |
|---|---|---|
| C9 | **$1,982** | "Replit charged me $1982 in 24 days on a pre-launch" |
| C6 | **~$1,000** | "I've been charged nearly $1,000, including a recent $60 charge for a 'code refactor' that the AI never actually completed" |
| C8 | **$1,000** | "A friend of mine had his $1000 API balance drained" |
| C4 | **$700+** | "In under 72 hours, my project had racked up over $700 in expenses" |
| C11 | **$400** | "Replit's AI agent cost me $400 by fixing my code" |
| C5 | **$40** | "I only realized it after receiving a $40 charge from someone exploiting my key" |
| C2 | **$4** | "a modification that took 14 minutes and cost $4" (the trigger cost, not the total damage) |
| B5 | **€5,000–€10,000 (projected)** | "I could end up spending between €5,000 and €10,000 before I reach a version I'd consider 'complete'" |

### Data / time / effort

| Finding ID | Loss | Verbatim |
|---|---|---|
| C1 | **Six years of content** | "That data represents six years of effort" |
| C2 | **200 MiB of 800 MiB** | "200 MiB of data from my 800 MiB app has been deleted" |
| C3 / A16 | **All code + commit history** | "I accidentally wiped out all the code in my GitHub repository, and even worse, I also erased the entire commit history" |
| C7 | **Entire production database** | "Claude Code wiped my entire production database" |
| C10 | **Entire project** | "Cursor Agent ran rmdir /s /q on Windows and deleted my [project]" |

### Face / reputation

**NOT IN RESEARCH.** No finding references reputational damage, embarrassment before clients, or social/professional consequences. The only adjacent signal is B4: "Please do not be rude" — which is a request for gentle treatment in the help forum, not evidence of reputational stakes. The stakes in this corpus are **money, data, and time** — not face.

### The project itself

Several findings imply the entire project is at risk, but none state it in those words. The closest:
- B5: "I could end up spending between €5,000 and €10,000 before I reach a version I'd consider 'complete'" — implies the project may never be completed.
- C6: "Deleted or replaced working files," "Added duplicate or broken modules" — the project is actively degrading.

---

## 5. WHAT THEY ALREADY UNDERSTAND — Mental models the corpus evidences

Only models evidenced by a user's own words. Nothing inferred.

| Mental model they have | Finding ID | Evidence (verbatim) |
|---|---|---|
| **They know tool/service names exist** (even if they can't evaluate them) | A10 | "I've come across terms Supab, PostgreSQL Firebase, MongoDB" — they can name the options |
| **They understand "always allow" grants something** (even if they don't know what) | A6 / B4 | "I literally always say always allow. I have no idea what the stuff they are asking means" — they know they are making a permission choice |
| **They understand the AI writes the code and they don't** | A15 | "AI writes my code now. I have no idea why half of it is the way it is" |
| **They know there is a trust/knowledge boundary** | A18 | "Trying to figure out where the line is between 'trust the AI' and I have no idea what's in my own app" |
| **They have a concept of "trustworthy" / quality** (even if they can't evaluate it) | A20 | "Is this a good, trustworthy repo? Can someone who knows this space verify this is helpful?" |
| **They can tell when the AI isn't doing what they want** (even if they can't say why) | A19 | "I will tell it that it's being ridiculous when it doesn't do what I want" |
| **They know the app "works" or "doesn't work"** (binary outcome) | A7 | "it works" — they can observe functional outcome |
| **They understand cost accumulates** (even if they can't predict it) | B8 | "Supabase gets expensive quickly" |
| **They understand vendor lock-in exists** (retrospectively) | B11 | "I let Lovable manage it from the start (had no idea beforehand)" |
| **They understand frontend code is publicly accessible** (after the fact) | C5 | "easily accessible to anyone who right-clicked" |
| **They know the word "hallucinating" exists** (but can't apply it) | A14 | "How do you know the AI is hallucinating if you don't code?" |
| **They can estimate rough cost ranges** | B5 | "between €5,000 and €10,000" |

**What they do NOT have (evidenced by absence):** The corpus shows no user who already understands what a database *is* (only the names), what deployment *does* (only that it exists), what git *is for* (A4: "Git for what?"), or what an environment variable *protects* (A1/A2). The game can build on **names they've heard, outcomes they can observe, and the trust boundary they already feel** — but it cannot assume they have any structural mental model of how software works.

---

## 6. WHAT WOULD HAVE SAVED THEM — For each section C mistake

The single piece of knowledge or one habit that would have prevented each expensive mistake, drawn only from what the finding itself reveals about the cause.

| Finding | The mistake | What would have saved them | Evidenced by? |
|---|---|---|---|
| **C1** | Agent deleted 90% of database during "straightforward updates" | **A database backup taken before letting the agent run.** A11 evidences that this user does not know how to back up: "I'm not familiar with the process of backing up my database." | Yes — A11 directly |
| **C2** | Agent deleted 200 MiB, rollback didn't restore data | **Knowing that "rollback" restores code, not database contents.** The user assumed rollback = full restore. The finding itself reveals the gap: "even after rolling back, that data doesn't restore." | Yes — the finding's own words reveal the misconception |
| **C3** | Accidentally wiped GitHub repo + commit history | **Knowing which git operations are irreversible.** A16: "I'm baffled by how I could have deleted both the code and the commit history" — the user didn't know the action was destructive. | Partially — the finding shows they didn't understand; the specific git command is NOT IN RESEARCH |
| **C4** | $700+ runaway AI agent loop from a single user click | **Setting a spending cap / usage limit before deploying an AI-agent feature.** The user had no spending guardrail. | Inferred from the finding — the corpus does not show a user stating "I should have set a spending limit," but the causal chain is explicit in C4 |
| **C5** | API key hardcoded in frontend JS, $40 exploited | **Knowing that anything in frontend JavaScript is visible to everyone, and that API keys belong in environment variables (.env).** A1 and A2 evidence the broader gap: users don't understand .env files or where API keys should go. | Yes — A1, A2, and C5 form a direct chain |
| **C6** | ~$1,000 charged for broken/incomplete AI work | **The ability to verify whether the AI actually completed the task it charged for.** A14 evidences the root inability: "How do you know the AI is hallucinating if you don't code?" | Yes — A14 directly |
| **C7** | Claude Code wiped entire production database | **Same as C1: a backup, and knowing that agents can execute destructive database operations.** | Yes — same chain as C1/A11 |
| **C8** | $1,000 API balance drained from leaked credentials | **Same as C5: credential hygiene — secrets in environment variables, not in client-side code.** | Yes — same chain as C5/A1/A2 |
| **C9** | $1,982 in 24 days on a pre-launch app | **Monitoring cloud spend, or understanding the pricing model before deploying.** B8 evidences adjacent awareness: "Supabase gets expensive quickly." | Partially — B8 shows cost awareness exists but not the monitoring habit |
| **C10** | Cursor agent ran `rmdir /s /q`, deleted project files | **Reading or understanding what a command does before clicking "always allow."** A6/B4 is the exact behavioral pattern: "I literally always say always allow. I have no idea what the stuff they are asking means." | Yes — A6/B4 directly |
| **C11** | $400 from agent "fixing" code the user didn't understand | **Reviewing what the agent proposes to change before approving it.** Same root as C6 and A14 — the user cannot evaluate agent output. | Yes — A14, A18 |
| **C12** | Agent destroyed databases via approved destructive migration | **Same as C1/C7: a backup, and recognizing a migration as a destructive operation before approving it.** | Yes — same chain |

### Cross-cutting pattern

Three habits would have prevented the majority of the 12 expensive mistakes:

1. **Back up the database before letting an agent touch it** — would have saved C1, C2 (partially), C7, C12. **4 of 12 failures.**
2. **Never put secrets in frontend code; use environment variables** — would have saved C5, C8. **2 of 12 failures.**
3. **Understand what you are approving before clicking "always allow"** — would have saved C3, C4 (partially), C10, C11, C12 (partially). **~4 of 12 failures.**

**A game that teaches these three habits addresses at least 8 of the 12 documented catastrophic failures.**

**NOT IN RESEARCH:** Whether teaching these habits *in a game context* would transfer to real-world behavior. The corpus shows what users don't know and what it cost them; it does not show that any educational intervention changed their outcomes.

---

## Meta-finding: Where the evidence is thin

1. **Emotional diversity is narrow.** The corpus only captures people who are already in trouble (posting on Reddit for help). The game's target audience also includes people who are still in the "fun" phase (A21: "vibe coding is fun until…"). The corpus has **zero findings from a user who is currently enjoying themselves and has not yet hit a wall.** Game design that assumes the player arrives scared or confused may be wrong — they may arrive having fun, and the game's job is to reach them before the "until."

2. **The "design" and "pm-tools" islands returned zero findings** (section D). The owner overrode this as a build signal (INTERVIEW, scope challenge). The research genuinely does not support content for these islands — any Level 1 vocabulary there is authored from first principles, not from evidence. This is recorded in INTERVIEW.md and is not a gap to fill with speculation.

3. **No "near miss" exists in the corpus.** Every failure landed. The game cannot draw on real user reports of "I almost approved something destructive but caught it." If the game models near-misses, that design decision is NOT evidence-backed.

4. **One tool call returned partial data** (Call 9, the "totally confused" post). The quote for A17 is sourced from the SERP result, not the Reddit post API (ugc-research.md, TOOL FAILURES section). The quote is the post title/description, not a comment. This is the thinnest single finding in the corpus.

5. **Frequency signals are approximate.** The corpus explicitly states (line 3 of ugc-research.md): "Frequency signal is approximate — based on how many independent source threads surfaced the concept across the calls, not exact counts." The heat map percentages (section D) are derived from these approximate counts, not from a statistically valid sample.
