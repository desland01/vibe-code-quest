# Consequence Safety Evidence — can a simulated catastrophe be made safe for a shame-sensitive adult learner?

**Date:** 2026-08-03 · Resolves [.scratch/terrain-course-design/issues/03-safe-catastrophe-evidence.md](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/03-safe-catastrophe-evidence.md)

## Method note (APIs called, what returned)

All research this session used live metered APIs. No free WebSearch was used.

| API / tool | Calls | Result |
|---|---|---|
| `mcp__perplexity__perplexity_ask` (Perplexity Agent API, `search_context_size: high`) | 6 | All returned data with citations. Load-bearing for: simulation psychological-safety literature, EMT moderators, failure counter-evidence, adult-ADHD rejection sensitivity, condition modifiers, EMT population composition. |
| `mcp__perplexity__perplexity_research` | 3 (2 distinct queries + 1 shortened retry) | **All failed** — `Perplexity API error: invalid request`. Retried once per the standing rule, then routed to `perplexity_ask` on the same metered API, which worked. The API is up; the `research` preset is broken in this environment. Flagged, not worked around silently. |
| `mcp__firecrawl-mcp__firecrawl_scrape` | 4 | All returned full text. Sources read at source, not from abstracts: Powers & Moore 2021 (full paper), Kumar et al. 2023 meta-analysis (full paper), Fraser et al. 2014 (full structured abstract with numbers), Somerville et al. 2023 (full paper). |
| `mcp__firecrawl-mcp__firecrawl_search` | 1 | Returned results (oversized; partially read). |

**Sources read at source (full text, this session):** Powers & Moore 2021 scoping review; Kumar et al. 2023 simulated-mortality meta-analysis; Somerville et al. 2023 twelve-tips pre-brief paper; Fraser et al. 2014 RCT (structured abstract with all reported statistics — full text is paywalled at Chest; every number cited below appears in that abstract).

**Sources cited from search-returned summaries, NOT read at source** — graded lower accordingly: Keith & Frese 2008 moderator breakdown, Devonshire et al. 2014, the adult-ADHD rejection-sensitivity studies, and the rage-quit/self-efficacy studies. Where a number could not be verified at source it is marked *(unverified at source)*.

## Headline finding

**The distinction the design depends on is real and is directly evidenced — by one scoping review that was built to find exactly this, and it found the boundary in the place the design puts it.** Powers & Moore (2021) reviewed all game-based-learning research on failure states and introduced the term **unit of failure**: *the specific game element which represents failure within the game context*. They arrayed the 14 studies on a spectrum from "no risk" to "real-life risk" and reported two failure modes at the two ends. At the no-risk end, learners wheel-spin and guess randomly, and failure teaches nothing. At the real-life-risk end — where the unit of failure was **the learner's actual course grade** — they report "a negative effect associated with motivation in participating in game-experiences… when risk levels affect real life." In-fiction units (patient health, production time, avatar health, tokens) sit in the productive middle. That is the same cut the creative vision makes: scar the sim, protect the save.

**But the evidence puts a condition on it that the current design violates.** The single strongest counter-evidence in this whole literature is Fraser et al. (2014) — a 116-participant RCT in which the failure was *unexpected*, and the cost showed up three months later. The simulation field has since converged on the position that surprise is the harmful ingredient, not consequence: Monteiro & Sibbald (2020), quoted in the Dundee twelve-tips paper, call it "a harmful and ingrained myth that uncertainty and surprise promote learning," concluding that "ambiguity does not lead to effective clinical education," and Somerville et al. (2023) rule that learners must not face "hidden surprises or perceived trickery." ALWAYS ALLOW §6 currently specifies a destructive operation **dressed as routine** ("clean up old records") — a disguised trap. The consequence is defensible; the disguise is the part the evidence argues with. This is the actionable finding of this document.

**And the population evidence does not exist.** The error-management-training base is university students doing lab software tasks. No EMT or productive-failure study has been run on adults with low prior knowledge, high dropout risk, ADHD, or high shame proneness. That is not a weak finding — it is an absent one, and it caps the verdict below at NEUTRAL for this audience.

## Graded claims table

| # | Claim | Population | Grade | Source (verified 2026-08-03) | Design rule it licenses |
|---|---|---|---|---|---|
| 1 | The *unit of failure* — what the loss is denominated in — is a distinct design variable that changes learner outcomes, independent of whether failure occurs at all | GBL studies, 14 articles | **Moderate** (scoping review, heterogeneous designs, explicitly not meta-analysable) | Powers & Moore 2021 [C1] [EXTRACTED] | The in-fiction / learner-progress distinction is a real design lever, not a rationalization |
| 2 | When the unit of failure is a **real-life learner consequence** (actual course grade), there is a negative effect on motivation to participate | University students | **Moderate-weak** (2 studies within the review; direction consistent, no pooled estimate) | Powers & Moore 2021 citing Bouchillon & Stewart 2020, Robson 2019 [C1] [EXTRACTED] | Never denominate failure in course progress, save state, or anything the learner earned |
| 3 | When failure carries **no** risk or consequence, learners wheel-spin, submit randomly, and it is ineffective | University students (programming, dentistry) | **Moderate-weak** (2 studies, converging) | Powers & Moore 2021 citing Flores & Rodrigo 2020, Sipiyaruk et al. 2017 [C1] [EXTRACTED] | Fail-soft-only retry is *also* an evidenced failure mode — the ADHD synthesis's rule #5, taken to its limit, produces this |
| 4 | Avatars and anonymity **depersonalize** failure and reduce its social stigma, increasing willingness to fail | Students | **Moderate-weak** (3 studies, no pooled estimate) | Powers & Moore 2021 citing Chen et al. 2012, Chen & Chen 2013, Cameron & Bizo 2019 [C1] [EXTRACTED] | The fiction can carry the blame — a surrogate absorbs failure the learner would otherwise take personally |
| 5 | Higher-risk (more real-world-consequential) versions of the same intervention did not change initial knowledge but **improved later retention** | 5th-grade students | **Weak** (single study, children, *unverified at source*) | Devonshire et al. 2014, via Powers & Moore 2021 [C1] | Weak support that consequence aids durability; do not lean on it |
| 6 | **Unexpected** simulated death produced more negative emotion, higher cognitive load (d=0.42), and lower rated competence 3 months later (OR 0.37, 95% CI 0.14–0.95) | 116 final-year medical students | **Strong** (RCT, delayed outcome, adjacent population) | Fraser et al. 2014, *Chest* [C2] [EXTRACTED] | **Surprise is the harmful variable.** Forewarn that hazards exist |
| 7 | Simulated patient mortality raises learner stress (pooled SMD 0.63, 95% CI 0.17–1.09); knowledge retention is **mixed** — 3 of 5 studies improved, 1 null, 1 **decreased** | 384 learners, 6 RCTs | **Moderate** (meta-analysis, all studies "some concerns" for bias) | Kumar et al. 2023, *Cureus* [C3] [EXTRACTED] | Consequential simulated loss reliably costs stress and does **not** reliably buy retention. The upside is conditional; the cost is not |
| 8 | Simulated death is usefully typed as **expected / unexpected / caused by learner action or inaction** — an agency-and-forewarning taxonomy already standard in the field | Healthcare simulation | **Established framework** (not an effect claim) | Leighton, via Kumar et al. 2023 [C3] [EXTRACTED] | Gives the design three distinct failure types to specify separately, not one "catastrophe" |
| 9 | Pre-briefing, an explicit fiction contract, confidentiality, and stated formative (non-evaluative) purpose establish psychological safety and reduce learner anxiety | Healthcare learners | **Moderate** (consensus guidance + qualitative base; largely conceptual, no pooled effect size) | Rudolph, Raemer & Simon 2014 [C4]; Somerville et al. 2023 [C5] [EXTRACTED] | Framing conditions are the best-supported lever available. Cheap to implement, and the literature is most confident here |
| 10 | Hidden surprises, ambiguity, and perceived trickery **harm** learning; "ambiguity does not lead to effective clinical education" | Healthcare learners | **Moderate** (position paper adopted into consensus guidance) | Monteiro & Sibbald 2020, quoted in Somerville et al. 2023 [C5] [EXTRACTED] | **Directly challenges the disguised-trap proposal in creative-vision §6** |
| 11 | Error-management training works overall (d=.44; transfer d=.56; adaptive transfer d=.80), and works **much better with high-clarity feedback** (d≈.57) than low-clarity (d≈.19) | 24 studies, N=2,183 | **Strong for the main effect** (meta-analysis); **weak-moderate** for the feedback moderator (*unverified at source*) | Keith & Frese 2008 [C6] | Feedback clarity is a load-bearing requirement, not a polish item. An opaque catastrophe forfeits most of the effect |
| 12 | The EMT evidence base is **university students and lab-based trainees doing computer/software tasks**. No EMT or productive-failure study exists for adults with low prior knowledge, low educational attainment, high dropout risk, ADHD, or high shame proneness | — | **Established absence** (searched deliberately; nothing found) | Keith & Frese 2008 [C6] + targeted search returning no such studies | The d=.44 headline **cannot be transported to this audience**. It is a prior, not a warrant |
| 13 | Unguided/exploratory learning is cognitively demanding for novices and can **reduce** learning outcomes through working-memory load | Novice learners | **Moderate** (review) | Exploratory-learning review [C7] (*unverified at source*) | Establish vocabulary and a working baseline before the destructive event (already in mechanics-research §3 step 1) |
| 14 | Failure attribution correlates **negatively** with intention to continue participating; lower self-efficacy correlates with more failure attribution | 172 fourth-grade students, VR game | **Weak** (children, correlational, coefficients not reported) | Kuo et al. 2021, *IJIET* [C8] (*unverified at source*) | Attribution is the mechanism to control. Who the fiction blames matters more than what was lost |
| 15 | Frustration from failure and inability to master a game produces reduced enjoyment, aggression, and rage-quitting | College-aged players, avid gamers, children | **Weak-moderate** (mixed lab/survey/qualitative; no effect sizes retrieved) | Przybylski et al. 2014 [C9]; rage-quit qualitative work [C10] (*unverified at source*) | Real withdrawal mechanism, but driven by **competence frustration**, not by consequence as such |
| 16 | Adults with ADHD show elevated rejection sensitivity, lower self-esteem, and lower self-compassion; **"rejection sensitive dysphoria" is not a validated construct** | Adults / college students with ADHD | **Weak-moderate** (small samples, mixed findings, one null between-group result) | Canu & Carlson 2007 [C11]; Bodnár et al. 2024 [C12] (*unverified at source*) | The shame-sensitivity premise is directionally supported but **thinner than the ADHD synthesis implies**. Do not cite RSD as established |
| 17 | There is **no well-powered experimental evidence** on how adults with ADHD respond to failure or error feedback in learning or performance settings | Adults with ADHD | **Established absence** | Confirmed by targeted search [C11][C12][C13] | The central conflict cannot be resolved from literature. Playtesting is the only resolving layer |

## The decisive question, answered

**Does the evidence distinguish loss of in-fiction/simulated state from loss of learner progress? Yes — and the distinction is drawn in the literature at the exact place the design draws it.**

Powers & Moore's unit-of-failure spectrum is not an inference someone built to defend a design; it is the organizing finding of the only scoping review written on failure states in game-based learning, and it was derived by coding what each study made the learner lose. Their conclusion names the harmful case specifically: the negative motivational effect appears "when risk levels affect real life" and when "the unit of failure for the game-based intervention is the course grade." In-fiction units of failure — patient health, avatar health, production time, tokens — carry no such finding against them, and one of them (patient health, Glover & Bodzin 2020) is explicitly described as immersing the learner in a real-world-analogous scenario *without real-life consequences*.

The mechanism has independent support. Chen et al. (2012), Chen & Chen (2013), and Cameron & Bizo (2019) all found that avatars and anonymity — surrogates that stand between the learner and the failure — increase willingness to fail by absorbing the social stigma. The simulation field's fiction contract does the same work by explicit agreement rather than by proxy. A simulated project taking a scar is structurally the same move: something that is not the learner takes the hit.

**So the ADHD synthesis's bounce-risk #3 is not simply right as stated.** "Punishment or loss states (streak breaks, lives, lockouts) — one shame hit and the product is 'not for me' forever" lists three mechanics that are all *learner-progress* units of failure. Streaks, lives, and lockouts take away something the learner earned and gate what they may do next. That is the harmful end of the spectrum, and the synthesis is correct to ban them. It does not follow, and the literature does not support, that in-fiction consequence belongs in the same category. **The two documents are less in conflict than the ticket assumes — they are describing opposite ends of one spectrum, and each named its own end.**

**However, the anxiety literature is not fully answered by the distinction.** Kumar et al. (2023) is the sharpest caution: across 6 RCTs and 384 learners, simulated in-fiction death — patient mortality, not learner progress — still produced a *reliable* stress increase (SMD 0.63) and an *unreliable* retention benefit (3 improved, 1 null, 1 worse). The in-fiction/progress distinction protects the learner's investment; it does not make the emotional hit disappear. And Fraser et al. (2014) shows an in-fiction loss producing measurable harm to competence three months out. Both of those losses were in-fiction. So: the distinction is real and load-bearing, but it is **necessary and not sufficient**. What separates the good outcomes from the bad ones inside the in-fiction category is the condition set below.

## The conditions, as design-checkable rules

Each rule is stated so a reviewer can check a build against it and return pass/fail.

**R1 — FOREWARNING. The player must know before the run that hazardous proposals exist and that approving one has consequences.**
Check: does the player encounter, before the first hazardous proposal, an explicit statement that some proposals are dangerous and that the project can be damaged?
Evidence: Fraser et al. 2014 — the harm was attached to *unexpected*; Somerville et al. 2023 — no "hidden surprises or perceived trickery"; Monteiro & Sibbald 2020 — "ambiguity does not lead to effective clinical education." Grade: **Strong** (one RCT plus adopted consensus guidance).
**This rule is currently failed by creative-vision §6**, which specifies a destructive operation "dressed as routine." Note the fix is cheap and does not cost the design anything: forewarning that hazards exist is not the same as flagging *which* proposal is the hazard. Rudolph's "artfully vague" principle (Somerville et al. 2023, Tip 2) is precisely this — orient the learner without spoiling the problem. Discrimination remains the skill; the ambush is what goes.

**R2 — AGENCY. The catastrophe must follow from a decision the player made and could have made differently, with the alternative visibly available at the moment of choice.**
Check: at the moment of every hazardous proposal, were *Look first* and *Don't allow* both present, functional, and sufficient to avert the outcome?
Evidence: Leighton's taxonomy (via Kumar et al. 2023) treats "death due to action or inaction" as categorically distinct from imposed death; Powers & Moore's definition of risk requires the activity be "participatory." Grade: **Moderate** (framework-level, no controlled comparison of learner-caused vs imposed failure found — this is the largest evidential hole in the condition set). Marked **[INFERENCE]** that learner-caused failure is emotionally safer than imposed failure; the taxonomy separates them but no study contrasts their outcomes.
Currently passed by the design.

**R3 — ATTRIBUTION. The fiction must blame the situation or the agent, never the player's character or competence.**
Check: run the incident-mode copy against the banned-phrases suite. Does any line attribute the outcome to the player's judgment, ability, or attention? Does the agent take responsibility in its own voice?
Evidence: Kuo et al. 2021 — failure attribution negatively correlates with intention to continue; Chen et al. 2012/2013 — surrogates that absorb blame increase willingness to fail; Somerville et al. 2023 Tip 3 — feedback "developmental, rather than judgemental." Grade: **Moderate**.
Currently passed, and this is the design's strongest suit: the agent apologizing in the corpus's own voice ("I'm deeply sorry I destroyed your working databases") is an attribution move with direct support.

**R4 — RECOVERABILITY. A walkable recovery path must exist and be discoverable from inside the incident, and the residual loss must be bounded and stated.**
Check: from any reachable incident state — including "player never took a backup" — can the player reach contract completion? Is the permanent residue enumerable and shown?
Evidence: Kumar et al. 2023 and Rudolph et al. 2014 both treat "safe space to learn from error" as conditional on the error being discussable and non-final; Powers & Moore's harmful end is defined by irreversibility into real life. Grade: **Moderate**.
Currently passed (degraded completion is specified).

**R5 — UNIT OF FAILURE. Nothing the learner earned may ever be the unit of failure.**
Check: enumerate every quantity the incident can decrement. Is any of them course progress, completed contracts, campaign save state, or elapsed real learner time?
Evidence: Powers & Moore 2021 — the course-grade unit is the one with a reported negative motivational effect. Grade: **Moderate**, and this is the single most directly on-point empirical finding in the document.
Currently passed. Keep the hidden checkpoint; it is doing real evidenced work.

**R6 — FEEDBACK CLARITY. The causal chain from the approval to the damage must be explicit, immediate, and inspectable.**
Check: after the incident lands, can the player point at the exact proposal that caused it, in the ledger, without assistance?
Evidence: Keith & Frese 2008 — high feedback clarity d≈.57 vs low d≈.19. Grade: **Moderate** (the main effect is strong; this moderator is *unverified at source*).
Currently passed by the ledger design. Note the magnitude: an opaque catastrophe forfeits roughly two-thirds of the EMT effect. Feedback clarity is not polish.

**R7 — FRAMING. The activity must be explicitly formative, explicitly fictional, and explicitly non-evaluative, stated before play.**
Check: does the player receive, before the first proposal, a statement that this is practice, that nothing here is a test, and that no record of their performance is kept or judged?
Evidence: Rudolph et al. 2014 (safe container, fiction contract); Somerville et al. 2023 Tips 1, 3, 5. Grade: **Moderate**, and the condition the literature is most confident about.
Partially met — the tone ruling covers register, but no explicit fiction contract or formative declaration is currently specified. Cheapest available intervention with the best-supported evidence behind it.

**R8 — NON-ZERO RISK. Failure must cost something in-fiction; unlimited consequence-free retry is itself a documented failure mode.**
Check: can the player brute-force past a hazardous decision by retrying without any in-fiction cost?
Evidence: Powers & Moore 2021 citing Flores & Rodrigo 2020 and Sipiyaruk et al. 2017 — wheel-spinning and random submission under no-risk conditions. Grade: **Moderate-weak**.
This rule exists to stop an over-correction. If the response to the ADHD synthesis were "fail-soft everything," the design would land on the *other* documented failure mode.

## Counter-evidence

Searched for deliberately, per the ticket. This section is not balanced against the supporting evidence — it is the strongest case against the design that the literature supports.

1. **Fraser et al. 2014 is genuine, well-designed harm.** 116 final-year medical students, randomized, and the cost was still measurable three months later: lower odds of being rated competent (OR 0.37). Not self-report of feeling bad — a delayed performance decrement. The population is high-achieving, high-prior-knowledge, institutionally supported, and professionally selected: **more resilient than ALWAYS ALLOW's audience on every axis that matters.** If unexpected in-fiction catastrophe damaged them at three months, the prior for a shame-sensitive non-technical founder is worse, not better. This is the strongest single argument against the design as currently specified.

2. **The retention benefit is not reliable even when the stress is.** Kumar et al. 2023: stress up reliably (SMD 0.63), retention mixed (3/5 improved, 1 null, **1 decreased**). The bet is not "pay stress, get learning." It is "pay stress, and sometimes get learning, depending on debrief quality and the individual learner." The review's own conclusion is conditional on "select students" and "a skilled debriefer" — a human facilitator reading the room, which a shipped web game does not have. **[INFERENCE]** that a scripted debrief bridge can substitute for a skilled human debriefer; nothing in this literature supports that substitution, and the whole simulation field treats the debriefer as the active ingredient.

3. **The course-grade finding cuts both ways.** Powers & Moore found the negative motivational effect where failure "affect[ed] real life." ALWAYS ALLOW's players are founders whose *actual businesses* are at stake in the real domain being simulated. **[INFERENCE]**, but a live one: for this audience the sim may not be experienced as safely fictional at all. A founder watching simulated customer rows vanish may be having a real-life-risk experience in Powers & Moore's sense, because the sim is a rehearsal of a loss they can actually incur next week. The fiction contract is thinner here than in medical simulation, where the student is not personally liable for the manikin.

4. **Competence frustration produces withdrawal.** Przybylski et al. 2014 and the rage-quit literature locate quitting in the inability to master, not in consequence per se. Relevant because the ALWAYS ALLOW player is explicitly modeled as someone who *cannot currently discriminate safe from dangerous proposals*. If inspection does not rapidly become legible, the failure mode is not shame — it is competence frustration, and the exit looks the same.

5. **The population evidence is absent in both directions.** No EMT study, no productive-failure study, and no controlled failure-feedback study exists for adults with ADHD, low prior knowledge, or high dropout risk. The d=.44 belongs to university students in lab software training. **The design cannot claim it, and neither can the objection.** Both sides of the repo's internal conflict are extrapolating.

6. **The shame premise is weaker than the ADHD synthesis states.** "Rejection sensitive dysphoria" is not a validated construct and is absent from ADHD diagnostic criteria. Canu & Carlson (2007) found elevated rejection sensitivity **was not supported** as a simple between-group difference in adults with ADHD, though both ADHD groups had lower self-esteem than controls. The supportive findings (Bodnár et al. 2024, n=304) are correlational student samples. Rejection sensitivity in adult ADHD is a real research construct with a thin evidence base — not the settled fact that bounce-risk #3 implies. This weakens the objection to the design as much as the missing population evidence weakens the design's own case.

## Where the evidence does not exist, stated plainly

- **No study contrasts learner-caused failure with system-imposed failure** on emotional or motivational outcomes. Leighton's taxonomy separates them; nothing measures the difference. R2 rests on a framework, not a finding.
- **No study tests whether a scripted, non-human debrief** can deliver the benefit that the simulation literature attributes to a skilled human debriefer. The entire upside of consequential simulated failure, in the medical literature, is routed through the debrief.
- **No study exists on failure states in game-based learning for adults with ADHD.** This reproduces the 2026-07-19 synthesis's headline gap exactly; a year of additional search has not closed it.
- **No effect sizes were retrievable** for the agency, attribution, and recoverability conditions. They are supported qualitatively and by consensus guidance only.
- **The distinction between "the sim is fiction" and "the sim is a rehearsal of my actual next week"** — which decides counter-evidence point 3 — is untested and probably untestable outside a playtest of this specific product.

## Verdict

**Evidence-SUPPORTED for the mechanism; evidence-NEUTRAL for this audience; CONDITIONALLY CONTRADICTED as currently specified in creative-vision §6.**

Unpacked:

1. **The central structural bet — protect the learner's progress, let the simulated project take permanent damage — is evidence-SUPPORTED.** Powers & Moore's unit-of-failure spectrum is direct, on-point evidence that what the loss is denominated in changes the outcome, and it locates the documented harm precisely at the learner-progress end that this design already protects. The ADHD synthesis's bounce-risk #3 and the creative vision's §3 are not in genuine conflict; they were describing opposite ends of one spectrum and each named only its own end. This document closes that conflict in the creative vision's favor **on the narrow question the ticket asked**.

2. **For this specific audience the verdict is NEUTRAL, and cannot be otherwise.** The EMT effect sizes belong to university students in lab software tasks. There is no EMT, productive-failure, or failure-feedback study for shame-sensitive, high-dropout-risk, low-prior-knowledge adults, and none for adults with ADHD. Neither the design nor the objection to it can claim empirical support for this population. The vertical slice's playtest is not a validation step — it is the only evidence layer that will ever exist for this question.

3. **As currently written, one condition is failed, and it is the one with the strongest evidence behind it.** The disguised destructive proposal in §6 is a hidden surprise, and forewarning is the variable that carried the harm in Fraser et al. 2014 and that consensus guidance names explicitly. The fix does not cost the design its thesis: tell the player up front that some proposals are dangerous and that the project can be damaged; do not tell them which one. Discrimination remains the skill. Add the explicit fiction contract and formative framing (R7) — the cheapest intervention with the best-supported evidence behind it. Make those two changes and every checkable condition in the R1–R8 set passes.

**Confidence:** High on the unit-of-failure distinction and on the forewarning problem — both rest on sources read at full text this session. Medium on the condition set as a whole, several conditions of which are supported by consensus guidance rather than controlled comparison. High on the absence claims; they were searched for deliberately and repeatedly.

## Bibliography

- [C1] Powers, F. E., & Moore, R. L. (2021). When Failure Is an Option: a Scoping Review of Failure States in Game-Based Learning. *TechTrends*. DOI 10.1007/s11528-021-00606-8. [EXTRACTED — full text] https://digitalcommons.odu.edu/cgi/viewcontent.cgi?article=1181&context=stemps_fac_pubs
- [C2] Fraser, K., Huffman, J., Ma, I., Sobczak, M., McIlwrick, J., Wright, B., & McLaughlin, K. (2014). The emotional and cognitive impact of unexpected simulated patient death: a randomized controlled trial. *Chest*, 145(5). DOI 10.1378/chest.13-0987. [EXTRACTED — structured abstract, full text paywalled] https://pubmed.ncbi.nlm.nih.gov/24158305/
- [C3] Kumar et al. (2023). The Effect of Simulated Patient Death on Learners' Stress and Knowledge Retention: A Systematic Review and Meta-Analysis of Randomized Controlled Trials. *Cureus*. DOI 10.7759/cureus.43278. [EXTRACTED — full text] https://pmc.ncbi.nlm.nih.gov/articles/PMC10492589/
- [C4] Rudolph, J. W., Raemer, D. B., & Simon, R. (2014). Establishing a safe container for learning in simulation: the role of the presimulation briefing. *Simulation in Healthcare*. https://pubmed.ncbi.nlm.nih.gov/25188485/
- [C5] Somerville, S. G., Harrison, N. M., & Lewis, S. A. (2023). Twelve tips for the pre-brief to promote psychological safety in simulation-based education. *Medical Teacher*, 45(12), 1349–1356. DOI 10.1080/0142159X.2023.2214305. [EXTRACTED — full text; contains the Monteiro & Sibbald 2020 quotation] https://discovery.dundee.ac.uk/files/118626964/Twelve_tips_for_the_pre-brief_to_promote_psychological_safety_in_simulation-based_education.pdf
- [C6] Keith, N., & Frese, M. (2008). Effectiveness of error management training: a meta-analysis. *Journal of Applied Psychology*. https://pubmed.ncbi.nlm.nih.gov/18211135/ (moderator breakdown *unverified at source*)
- [C7] Exploratory learning and novice cognitive load (review). https://eric.ed.gov/?id=EJ1258248 (*unverified at source*)
- [C8] Kuo et al. (2021). A Study of the Relationship among Self-efficacy, Cognitive Load, Failure Attribution, and Intention to Continue Participation. *IJIET*, 11. https://www.ijiet.org/vol11/1556-WC003.pdf (*unverified at source*)
- [C9] Przybylski, A., Ryan, R., Rigby, C. S. et al. (2014). Frustration in mastering video games linked to aggression. https://www.rochester.edu/newscenter/frustration-in-mastering-video-games-linked-to-aggression/ (*unverified at source*)
- [C10] Rage in video gaming: characteristics of loss of control (qualitative). https://hal.science/hal-04125551/document (*unverified at source*)
- [C11] Canu, W. H., & Carlson, C. L. (2007). Rejection sensitivity and social outcomes of young adult men with ADHD. *Journal of Attention Disorders*. https://journals.sagepub.com/doi/10.1177/1087054706288106 (*unverified at source*)
- [C12] Bodnár et al. (2024). ADHD symptoms and rejection sensitivity (n=304 college students). https://pmc.ncbi.nlm.nih.gov/articles/PMC11859226/ and https://journals.sagepub.com/doi/10.1177/09388982241271511 (*unverified at source*)
- [C13] Qualitative study of rejection sensitivity in adult undergraduates with ADHD (n=5). https://pmc.ncbi.nlm.nih.gov/articles/PMC12822938/ (*unverified at source*)

Studies referenced **inside** [C1] and cited here at second hand, not independently retrieved: Bouchillon & Stewart 2020; Robson 2019; Flores & Rodrigo 2020; Sipiyaruk et al. 2017; Chen et al. 2012; Chen & Chen 2013; Cameron & Bizo 2019; Devonshire et al. 2014; Glover & Bodzin 2020; Pozzi et al. 2015; Gauthier & Jenkinson 2017, 2018; Yang et al. 2020.
