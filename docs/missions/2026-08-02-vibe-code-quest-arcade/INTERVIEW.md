# INTERVIEW — Vibe Code Quest Arcade Rebuild

Mission: `2026-08-02-vibe-code-quest-arcade`
Date: 2026-08-02
Method: `/mission` Phase 1 grill (grill-with-docs posture — one question per turn, recommendation stated inline, answer shapes the next question).
Status: **CLOSED** — owner confirmed "Grill closed — go" on 2026-08-02.

---

## Original directive (verbatim, owner)

> change the UI to be one locked viewport like a true video game experience. This is a video game. make some old school catchy nintento like music. then, each island needs three levels (think of something funny in dev jargon relavent). the levels should be difficulty based. this is a game that is designed for vibe coders who know absolutely nothing about code or software. the goal of the game is to get them to understand the decision the AI coding models asking for input on so that they can be te human in the loop that the models still need. Also, let improve the copy. its too "claude-slop" word salad. clear beat clever. make it fun; don't go boring robot voice. juest be more direct and clear with the question. we need gamification too. movement, effects, sound effects too. the game boards should change as the game is played. finally, we shoould have charecters on the screen that react to the answers - think codex pets and claude pets. the charecters will be representing the user so there reaction is to the answer response - celebration when correct, a shrug when incorrect, have fable 5 get creative with this and let it really cook on the planning. otherwise keep the routing as per usual global rules

---

## Q1 — What is a "level"?

**Asked:** Are levels difficulty tiers built from the island's content (Path A), or gated groupings of the existing six landmarks (Path B)?

**Recommended:** Path A.

**Owner answer (verbatim):**
> the levels are going to be 2 more versions of what we have now but starting at the basics. level one is going to be just understanding the vocabulary what is a coding langue, what is a server, what is a repo? even down to the most basic dev jargon. level one should be easy and as we got to level 3 the understanding becomes more abstract. the current javascript vs typescript was too complex even for me. It felt too much like schoold work, and for a class that missed the first two semester off.

**Resolved:** Three difficulty tiers. Level 1 is pure vocabulary assuming zero knowledge. Difficulty rises to abstract by Level 3. Today's content is the ceiling, not the entry point.

**Load-bearing diagnosis captured:** the owner — who commissioned the product — found `languages/javascript-typescript` too complex. The ramp currently starts at semester three. This is the mission's root cause, not a polish item.

---

## Q2 — How big is one level?

**Asked:** Is one level a single 6–8 beat run (24 levels total), or a set of six landmarks (144 runs)?

**Recommended:** one run per level (24 levels, ~180 beats), re-pointing landmark pages/collectibles/XP at levels.

**Owner answer (verbatim):**
> your description is correct but I think you can reuse what you already have and more or less change the copy. think of the game now as islands with landmarks for each island. I want the landmarks to have two more levels, so run as exisit now but easier content (exactly as you descripbed it - name that thing, pick a lane, and tradeoffs. what we have now is only tradeoffs and the game player is expected to know too much and will not be knowlegable enough to make those tradeoffs. it may be helpful to research UGC with people going on reddit looking for help on how to blank while building with AI. Replit and Loveable surely have some content about this.

**Resolved (overrides the recommendation):** The landmark stays the unit. Each of the 48 landmarks gains two additional, easier runs above today's run. **144 runs total.** The existing run *shape* is reused; the ramp and the voice are what change.

Level names as spoken by the owner: **Name That Thing** (L1), **Pick a Lane** (L2), **Tradeoffs** (L3).

**Owner-requested research:** UGC from Reddit — people asking for help building with AI. Replit and Lovable communities named specifically. Executed; see `## Research executed` below.

---

## Q3 — What happens on a phone?

**Asked:** Portrait handling — rotate-to-play, portrait-native stage, or adaptive stage. Also proposed a build-failing overflow test.

**Recommended:** portrait-native.

**Owner answer (verbatim):**
> they are likely vibe coding on computers though so make it desktop first. ones we get the game play locked in then we'll worry about portriat

**Resolved (overrides the recommendation):** Desktop-first, one locked landscape stage. Portrait is explicitly a later mission, not a stretch goal in this one. Removes the dual-layout burden from this mission's scope.

---

## Q4 — The pets: whose are they?

**Asked:** Ship literal "Claude"/"Codex" branded characters (trademark exposure on a public MIT repo under the Truline brand), or original characters that read unmistakably as AI-helper archetypes.

**Recommended:** original characters.

**Owner answer (verbatim):**
> the pets was a reference - make it unique but same idea. but these are player charecters not helpers. they are the player avatar but a silly vibe-code lo-fi animation, similar to the model pets

**Resolved:** Original characters, no borrowed marks. Critically — they are **player avatars, not helpers**. The reaction is the player's own reaction to their own answer, not a tutor's verdict. Lo-fi, silly, "model pet" energy.

---

## Q5 — Where does the music come from?

**Asked:** Code-synthesized chiptune, AI-generated, or licensed packs.

**Recommended:** code-synthesized (only path where music reacts to gameplay; $0; no licensing risk; consistent with the repo's existing "no animation dependencies" discipline).

**Owner answer 1 (verbatim):**
> I like the sample music idea

**Ambiguity flagged rather than guessed** ("sample packs" vs "sample-and-approve gate"), because the two readings differ on spend and licensing.

**Owner answer 2 (verbatim):**
> new music - make a few version I can sample from

**Resolved:** Original music, synthesized in code, multiple variants per theme presented on one page for the owner to pick by ear. **No spend in this mission.**

---

## Q6 — The voice

**Asked:** Pick by ear from three drafts of the same Level 2 beat — A deadpan friend, B arcade announcer, C dry sitcom. Recommended A as baseline with C's timing on light beats and B confined to arcade furniture.

**Owner answer (verbatim):**
> A - think ryan renolds

**Resolved:** Deadpan, Ryan Reynolds register. Dry, self-aware, short sentences, states the obvious thing everyone is thinking, never mean, never smug. Confidence without hype. Arcade loudness lives only in the furniture (level banners, combo counters, stingers) — never in the question itself.

---

## Scope challenge and owner override

**Finding presented:** UGC research showed confusion concentrates in databases (22%), infra (19%), security (15%), ai-types (15%), git (13%), languages (11%) — and **pm-tools and design returned zero findings**. Presented as a possible build-order signal.

**Owner answer (verbatim):**
> people aren't asking design yet but they will. we build everything now

**Resolved:** Full scope. All 8 islands × 6 landmarks × 3 levels = 144 runs. No island cut, deferred, or deprioritized. Research seeds Level 1 vocabulary on the six islands where it exists; `design` and `pm-tools` Level 1 content is authored from first principles.

---

## Grill close — carried defaults

Presented at close and accepted with "Grill closed — go". These are recorded assumptions, not silent choices:

| # | Default | Rationale |
|---|---|---|
| D1 | Accessibility floor holds — keyboard-only play, screen-reader path, `prefers-reduced-motion`, colour never the only signal, audio muted until user gesture | Existing project commitment (`CLAUDE.md`, `e2e/a11y.spec.ts`); a locked-viewport arcade must survive it, not trade it away |
| D2 | Copy cannot overflow the locked stage — enforced as a build-failing test | Makes "clear beats clever" mechanical rather than aspirational; word salad physically cannot ship |
| D3 | Gating: clear L1 to unlock L2, L2 to unlock L3, per landmark. Islands themselves stay open | Preserves the difficulty ramp without forcing a linear 144-run march |
| D4 | Existing progress migrates — a landmark stamped today counts as L3 cleared | Live players must not lose progress |
| D5 | Existing URLs survive; level becomes a new path segment | 48 landmark URLs are public and indexed |
| D6 | Board evolution and character design go to Fable as the creative slice | Owner directive: "have fable 5 get creative with this and let it really cook" |
| D7 | Nothing deploys from this mission — ship-to-production is a separate approval | Safety floor |

---

## Research executed

Owner-requested UGC research ran during the grill via live API calls (Perplexity Research + Bright Data Reddit/SERP). Output: [`.frugal-fable/mission-arcade/ugc-research.md`](../../../.frugal-fable/mission-arcade/ugc-research.md) — 51 findings, each with a verbatim quote and source URL. 10 tool calls made, 9 fully successful, 1 partial and documented. Nothing fabricated.

Repo cartography ran in parallel: [`.frugal-fable/mission-arcade/repo-map.md`](../../../.frugal-fable/mission-arcade/repo-map.md) — content schema, beat grammar, state machine, XP seam, test blast radius, all cited to file:line.

**The single most useful research artifact** is a verbatim quote that is the product thesis stated by a stranger:

> "I literally always say always allow. I have no idea what the stuff they are asking means haha. Just out of curiosity how dangerous is that?"
> — r/cursor, https://www.reddit.com/r/cursor/comments/1v97cvq/how_bad_is_always_saying_always_allow/

---

## Open questions carried forward

None blocking. Two taste gates are scheduled rather than open:

1. **Music approval** — owner hears variants of every theme on one page and picks. Cannot be unit-tested.
2. **Character approval** — owner sees the cast rendered before 144 runs are written against them.

Both are HITL issues in `ISSUES.md`, not blockers on planning.
