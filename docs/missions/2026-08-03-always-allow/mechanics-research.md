# Bottom line

Your current design is **structural gamification**: the learning task remains a linear quiz, while game-like presentation or rewards sit around it. Research does **not** show that points, badges, or streaks always fail; it shows that they primarily affect **participation, repetition, and performance quantity**, while durable retention and transfer depend more on retrieval, feedback, spacing, meaningful decisions, error correction, and practice in structurally varied situations. Broad gamification meta-analyses are mildly positive, but they combine radically different designs and therefore do not validate “points on a quiz” specifically.[web:16][web:318][web:327]

For your repository-loss case, the evidence favors a **realistic, consequential, but rapidly recoverable simulation** followed by diagnosis and reconstruction—not permanent deletion of the learner’s earned progress. There is strong evidence for error-management training and productive failure, but I found **no controlled study specifically testing simulated repository deletion with nontechnical AI-assisted developers**.[web:226][web:428]

---

## 1. Why quiz-plus-points gamification disappoints

The premise needs qualification: **gamification as a broad category does not consistently fail**, but points/badges/leaderboards alone are weak instructional mechanisms.

| Researcher/study | What was tested | What it actually found | Implication for retention and transfer |
|---|---|---|---|
| **Karl Kapp — structural versus content gamification** | Conceptual distinction between changing the learning activity and merely adding rewards/progression around unchanged content | Structural gamification gives points, badges, levels, and leaderboards for completing otherwise unchanged videos or assignments. It aims primarily to propel the learner through content, not transform the content into a game.[web:346] | This describes your present design. It may increase completion but supplies no new mechanism for practicing software-system decisions. |
| **Richard Landers, Theory of Gamified Learning (2014)** | Theory connecting game attributes to learning outcomes | Landers argues that gamification normally affects learning **indirectly**, by changing learning-relevant behavior or attitudes or by strengthening an already sound instructional design.[web:327] | If the underlying task is shallow recognition, increasing the amount of that task mainly produces more recognition practice—not necessarily operational skill. |
| **Mekler, Brühlmann, Tuch & Opwis (2017)** | A 2×4 experiment isolating points, levels, and leaderboards in an image-tagging task | The elements increased the **quantity** of tags but did not significantly improve intrinsic motivation or perceived competence. The authors characterized them as extrinsic incentives for performance quantity.[web:318] | Evidence for “doing more,” not for remembering longer or transferring a skill. No delayed retention or software-skill transfer was tested. |
| **Hanus & Fox (2015)** | Longitudinal comparison of a college course using badges, leaderboards, and competition with a non-gamified course | Motivation, satisfaction, and empowerment declined more in the gamified course; lower final-exam performance was mediated by reduced intrinsic motivation.[web:20] | Competitive reward systems can backfire over time. This is one study, not proof that every leaderboard harms learning. |
| **Deci, Koestner & Ryan (1999)** | Meta-analysis of 128 experiments on extrinsic rewards and intrinsic motivation | Expected tangible, completion-contingent, and engagement-contingent rewards reduced subsequent free-choice motivation; positive informational feedback increased interest.[web:301][web:302] | A streak or badge that becomes the reason for acting can displace interest, especially when it rewards mere completion. A digital point is not identical to every tangible reward, so this is relevant theory and adjacent evidence rather than a direct test of quiz streaks. |
| **Sailer & Homner (2020)** | Meta-analysis of 44 gamification studies | Small-to-moderate positive effects appeared for cognitive outcomes, \(g=.49\), motivation, \(g=.36\), and behavior, \(g=.25\). Fiction and social interaction were important moderators.[web:16] | Gamification as a heterogeneous family can help. This result cannot be reduced to “points work”; the stronger designs often contained narrative, cooperation, feedback, or substantive play. |
| **Wouters, van Nimwegen, van Oostendorp & van der Spek (2013)** | Meta-analysis of serious games versus conventional instruction | Serious games produced small advantages for learning, \(d=.29\), and retention, \(d=.36\), but were not significantly more motivating. Benefits were greater with multiple sessions and supplementary instruction.[web:467] | This supports genuine game-based practice, not rewards layered over quizzes. It also rejects the assumption that “game-looking” automatically means motivating. |
| **Clark, Tanner-Smith & Killingsworth (2016)** | Meta-analysis of digital games and value-added game-design comparisons | Digital games outperformed nongame instruction by about \(g=.33\); augmented game designs outperformed basic versions by about \(g=.34\).[web:470] | Design inside the learning activity matters; “being a game” is not the causal explanation. |
| **Pan & Rickard (2018)** | Meta-analysis of retrieval-practice transfer | Retrieval practice produced a transfer advantage of \(d=.40\), strongest when practice demanded related responses, elaboration, feedback, and reasonably successful initial retrieval.[web:56] | A quiz can contribute to transfer, but only if it requires explanation, discrimination, reconstruction, or application. Repeated multiple-choice recognition has much weaker correspondence to configuring Git, repairing a migration, or diagnosing a deployment. |

### What is and is not established

- **Established:** points, badges, leaderboards, and streaks can change participation and short-term activity.[web:318][web:328]
- **Established:** richer gamification and serious games can produce small positive learning and retention effects on average.[web:16][web:467]
- **Not established:** that points or streaks independently cause durable retention or far transfer.
- **Not established:** that adding rewards to an unchanged multiple-choice sequence teaches operational software skills.
- **Important distinction:** “user retention” means returning to the product; “knowledge retention” means being able to retrieve or use knowledge later. Gamification studies frequently measure the first while product language implies the second.

---

## 2. Mechanics in games that teach through play

For most of the named entertainment games, the mechanic is well documented but **controlled evidence of real-world skill transfer is absent**. The “why it should stick” column therefore distinguishes direct evidence from a learning-science interpretation.

| Game | Specific teaching mechanic | What makes the learning stick | Direct evidence for transferable learning |
|---|---|---|---|
| **TIS-100** | The player writes simplified assembly programs in a grid of communicating nodes, runs them against input/output tests, observes execution, and can optimize node, instruction, and cycle counts.[web:181][web:182] | The concept is the verb: read input, alter state, communicate, branch, run, inspect failure, revise. Multiple valid solutions and separate efficiency measures invite repeated reconstruction rather than memorizing one answer. | A classroom case study used quizzes and observations and reported development of computational-thinking mental models, but it was not a strong randomized transfer test.[web:492] I found no controlled evidence that TIS-100 improves performance in a real programming language or software project. |
| **SHENZHEN I/O** | Build an actual circuit from components, program its microcontrollers in simplified assembly, consult component datasheets, and satisfy signal-based test specifications.[web:186][web:189] | Documentation lookup, implementation, execution traces, and failing test signals are integrated into the same loop. The learner must coordinate hardware topology, state, timing, and code rather than recite definitions. | I found no controlled retention or real-electronics/programming transfer study. Zachtronics offers the games to schools, but school availability is not efficacy evidence.[web:155] |
| **Opus Magnum** | Construct a programmable machine, get any valid solution working, then optionally redesign it against competing metrics: cost, occupied/swept area, and cycles. Optimization often requires a qualitatively different design.[web:211][web:493] | First solve establishes functional understanding; optional optimization creates variation, comparison, and repeated model revision. Multiple objectives make trade-offs visible instead of declaring one canonical answer. | I found no controlled learning or transfer study. The claimed educational value is a design analysis, not empirical proof. |
| **Human Resource Machine** | Drag programming instructions into a sequence; the worker visibly executes them against inbox/outbox data. New commands are introduced progressively, and optional challenges reward fewer instructions or faster execution.[web:67] | The player predicts program state, observes execution, diagnoses the first incorrect step, and edits the algorithm. Abstract control flow is embodied as visible movement of data. | A university project explicitly proposed testing transfer to a programming environment, but the available project page describes the planned comparison rather than published results.[web:67] I found no completed controlled transfer study. |
| **Factorio** | Build persistent production chains in which miners, belts, inserters, assemblers, power, buffers, throughput bottlenecks, and pollution interact continuously. A defect propagates downstream until the player traces and repairs it. | The factory is an executable systems diagram. Inputs and outputs physically move; queues expose capacity mismatch; the map overlay turns pollution into a visible cloud that eventually triggers attacks.[web:169] Repairing a bottleneck provides immediate causal feedback and the corrected system keeps operating. | I found no controlled human-learning study demonstrating transfer to software architecture, operations, or systems thinking. The Factorio Learning Environment assesses AI planning and error analysis, not human education.[web:176] |
| **Kerbal Space Program** | Construct a spacecraft under mass, thrust, fuel, staging, and aerodynamic constraints; launch it in a physics simulation; inspect orbit and trajectory; fail, redesign, and relaunch. | Orbital mechanics becomes manipulable: burns alter the predicted path, inadequate staging causes observable consequences, and successful transfer or rendezvous requires prediction rather than factual recall. | Unlike most games here, KSP has direct—but still limited—evidence: one study found significant gains in orbital-mechanics knowledge during participants’ early hours of play.[web:61] Educational reports also document its use as a virtual laboratory, but broad real-world engineering transfer remains unproven.[web:74] |
| **Papers, Please** | Maintain a changing rulebook, compare multiple documents, highlight discrepancies, accept or reject entrants, and receive immediate citations. Speed and accuracy determine income used for rent, food, heat, and medicine.[web:144][web:147] | Rules are not exposition: they are constraints the player must operationalize under time and resource pressure. Errors identify the violated rule, while cumulative economic consequences make procedural trade-offs memorable.[web:136] | Scholarship analyzes how the mechanics communicate bureaucratic and moral systems, but I found no controlled evidence of transfer to document auditing, compliance, or security work.[web:140] |
| **Return of the Obra Dinn** | Enter a person’s identity, fate, and sometimes killer in a ledger; the game validates and permanently typesets answers only when three complete fates are correct.[web:114][web:116] | Delayed batch confirmation prevents easy one-entry brute force. The player must maintain uncertainty, cross-reference several scenes, and form a small network of mutually supporting hypotheses. Recoverable pencil entries allow revision until evidence converges. | No controlled retention or detective-reasoning transfer study found. Claims that the three-at-a-time lock improves learning are design interpretations, not demonstrated educational effects. |
| **Her Story** | Search a police database using words spoken in interview clips; only the first five matches are returned, so each viewed clip supplies vocabulary for more discriminating searches.[web:122][web:127] | The player generates the next query from evidence rather than choosing a supplied question. Knowledge changes what actions become conceivable; search history and tagging externalize the evolving investigation.[web:126] | No controlled evidence found for transfer to research, database querying, or information literacy. |
| **Baba Is You** | Rules such as `ROCK IS PUSH` exist as movable word tiles. Forming or breaking a syntactically valid sentence immediately changes object behavior.[web:95][web:100] | Normally invisible program rules are both inspectable and manipulable. Every move is an executable hypothesis: alter a rule, immediately observe the new state, undo if it destroys the solution. | Research uses the game to study dynamic-rule reasoning and problem-solving, but I found no controlled evidence that playing it transfers to programming, formal logic, or software debugging.[web:91][web:94] |

### The common mechanics worth borrowing

| Effective mechanic | Why it differs from your current quiz |
|---|---|
| **An executable model** | The learner changes the system and observes the resulting state instead of selecting a verbal description. |
| **Prediction before execution** | The learner commits to what a command, migration, permission, or deployment will do. This is generation and retrieval, not recognition. |
| **Immediate causal feedback** | Feedback identifies what changed and where the learner’s model diverged from the system. |
| **Persistent consequences** | A previous decision changes later options, costs, risks, or system state. |
| **Undo, rollback, checkpoints, and alternate solutions** | Failure remains informative without becoming terminal. |
| **Multiple valid solutions and optimization criteria** | Players revisit a successful solution to improve safety, maintainability, speed, cost, or complexity. |
| **Information discovered through action** | New evidence creates new possible verbs, as in *Her Story*, rather than all answers being displayed upfront. |
| **Delayed validation where appropriate** | Obra Dinn’s batch confirmation preserves uncertainty and discourages brute force, but still eventually resolves it. |
| **Debrief or explicit bridge** | Game-specific knowledge is connected to the real tool. Serious-game benefits are larger when games are supplemented with instruction, and meaningful feedback supports reflection and transfer.[web:467][web:485] |

---

## 3. Consequential but recoverable mistakes

**Best-supported answer: yes, permit mistakes—but constrain the blast radius and guarantee an intelligible recovery path.** “Make them lose everything and start the course over” is not what productive-failure research tested.

| Evidence or risk | Findings | Relevance to simulated repository loss |
|---|---|---|
| **Sinha & Kapur’s productive-failure meta-analysis** | Across 53 studies and 166 comparisons, problem solving before instruction improved conceptual understanding and transfer by about \(g=.36\); high-fidelity productive-failure implementations reached roughly \(g=.37\)–.58.[web:424][web:428] | Let the learner attempt recovery or protection before showing the complete solution. The failure must then be consolidated through instruction that compares the learner’s attempt with a canonical strategy. |
| **Boundary conditions of productive failure** | Benefits depend on domain-relevant problems, useful prior knowledge, solution generation, scaffolding, and instruction that builds on learner attempts. Younger learners and domain-general skills sometimes favored instruction first.[web:421][web:422] | A novice who does not yet know what a repository, remote, commit, or backup is may experience only confusion. Establish enough vocabulary and a tiny successful baseline before the destructive event. |
| **Loibl, Roll & Rummel review** | Problem-solving before instruction helps when instruction uses contrasting cases or explicitly builds on the learner’s attempted solutions; merely delaying instruction is insufficient.[web:430] | After the wipe, compare: uncommitted local files, committed local history, pushed remote history, and external backup. “Try again” alone is not adequate. |
| **Keith & Frese error-management-training meta-analysis** | Across 24 studies and 2,183 participants, error-management training had an overall positive effect, \(d=.44\). Effects were larger for post-training transfer, \(d=.56\), and structurally different adaptive-transfer tasks, \(d=.80\). Active exploration and explicit error encouragement were effective components.[web:226] | This is the strongest direct support for letting learners make errors in a safe environment, especially when the goal is handling unfamiliar future failures. |
| **Desirable difficulties — Bjork & Bjork** | Spacing, interleaving, variation, and retrieval can reduce immediate performance while improving later retention and transfer.[web:33][web:43] | The desired difficulty is effortful diagnosis or recovery. Arbitrary loss of accumulated course progress is not one of the demonstrated desirable difficulties. |
| **Anxiety and attrition counter-evidence** | In an adult vocational online course, dropouts reported greater computer anxiety and more negative computer attitudes than active learners.[web:196] Reviews of online persistence also identify psychological factors, course complexity, support, and course structure as important.[web:202] | Your audience may already interpret repository loss as evidence that they are “not technical enough.” A humiliating or opaque catastrophe can reinforce that belief and prompt exit. |
| **Simulation/debriefing evidence** | Games and simulations generally benefit from meaningful feedback and reflection on misconceptions, although evidence on the best debrief format is mixed.[web:484][web:485] | The recovery and explanation are part of the mechanic—not an optional recap after the emotional event. |

### Safe design for the repository-loss scenario

This is an **evidence-informed recommendation**, not a directly tested recipe for repository deletion:

1. Give the learner a small project they have meaningfully changed.
2. Show—but do not force—a save point, commit, remote push, or backup decision.
3. Trigger a realistic destructive action: wrong directory deletion, force push, reset, secret exposure, or destructive migration.
4. Let the apparent loss persist long enough to be consequential: the app no longer runs, files vanish, or collaborators lose a branch.
5. Preserve a hidden scenario checkpoint so the learner’s course history and real time investment are never at risk.
6. Ask the learner to diagnose **which copies still exist**: working tree, commit graph, remote, deployment artifact, database snapshot, or teammate clone.
7. Let recovery consume a bounded resource such as time, trust, incident budget, or customer impact.
8. After recovery, require the learner to install the preventive control: push to remote, protect a branch, add a backup, test restore, or create a migration rollback.
9. Revisit the same principle later in a different setting. That variation is important for transfer.

**Avoid:** surprise destruction of hours of player-authored work, shame language, unrecoverable campaign resets, or withholding the causal explanation. The literature supports **errors plus recovery, framing, feedback, and consolidation**, not cruelty.[web:226][web:430]

---

## 4. Teaching invisible systems

Invisible state becomes learnable when the game supplies a **persistent external representation**, lets players **act directly on it**, and provides an observable before/after transition. Multiple representations can help with complex ideas, but only when learners can map them to one another; adding more diagrams without that mapping can increase cognitive load.[web:287][web:289]

| Invisible system | Successful legibility mechanic | Evidence and limits |
|---|---|---|
| **Git history, branches, HEAD and remotes** | *Learn Git Branching* draws the commit graph and moves branch/HEAD pointers immediately after typed commands. *Oh My Git!* shows the working directory, staging area, repository, and remotes while executing real Git; beginners can use command cards and later switch to the terminal.[web:244][web:245] | A study of command-line and Git exercises concluded that interactive visualizations can effectively teach practical computer-science skills.[web:241] This is the closest direct precedent for your version-control content. |
| **Program execution and transient variables** | *Human Resource Machine* animates each instruction and physically moves values among inbox, floor locations, worker hands, and outbox.[web:67] TIS-100 similarly exposes distributed nodes and communication rather than presenting “parallelism” as prose.[web:181] | The representations are documented, but strong real-programming transfer evidence for these games is absent. |
| **Rules and permissions** | *Baba Is You* turns active rules into visible sentences and permits direct manipulation; breaking the sentence visibly revokes the property.[web:95] | This is a strong design analogue for permissions: represent `USER CAN WRITE FILE` as a live relationship that can be granted, inherited, denied, or broken. No direct permissions-learning study was found. |
| **Environmental externalities** | Factorio represents accumulated pollution as a map cloud; pollution spreads and triggers larger enemy attacks.[web:169] | A delayed global variable becomes visible, spatial, inspectable, and causally connected to later consequences. No controlled transfer evidence to software systems was found. |
| **Orbital state** | KSP renders predicted orbital trajectories and makes burns visibly change the path; physical success or failure validates the prediction. | Direct evidence shows early gains in orbital-mechanics understanding, although broad engineering transfer is unproven.[web:61] |
| **Changing compliance state** | *Papers, Please* externalizes current policy in a rulebook; inspection mode links two facts; an immediate citation identifies the violated protocol.[web:144][web:147] | This demonstrates how an otherwise invisible rules engine can be made inspectable without eliminating uncertainty. Evidence concerns game analysis rather than measured job transfer. |
| **Database contents and query behavior** | SQL teaching systems let learners formulate real queries and immediately inspect returned rows or errors. QueryCompetition’s quasi-experiment found higher performance and motivation in its gamified condition.[web:272] | This provides some empirical support, but the intervention combined challenges, practice, competition, points, and leaderboards, so the causal contribution of visualization cannot be isolated. |
| **Deployment pipelines** | A pipeline can be represented as live artifacts moving through build, test, package, staging, approval, and production nodes, with logs and version identity attached to each artifact. | I found **no established commercial-game example or controlled study** proving transfer for this exact mechanic. A 2023 paper introducing *Journey to the Core of DevOps* said that, to its authors’ knowledge, no DevOps-learning serious game previously existed; its work presented an initial game rather than efficacy evidence.[web:273] |
| **File permissions** | Make effective access the result of visible relationships among user, group, role, object, inherited policy, and explicit denial; then let the player request an operation and watch the authorization trace. | I found cybersecurity games using terminal commands and real-world principles, such as *Hacknet*, but no controlled evidence specifically showing that a game taught file-permission reasoning or transferred it to real administration.[web:256][web:261] |

### Legibility principles

1. **Show the authoritative state**, not merely an animation: commit graph, deployed version, schema version, permission graph.
2. **Bind every command to a visible state transition.**
3. **Expose causality at failure time:** “production is running commit B; the fix exists only in local commit D.”
4. **Preserve history:** allow scrubbing backward, diffing before/after, and identifying the decision that introduced the defect.
5. **Use complementary representations:** diagram plus exact command/log—not diagram versus command as unrelated modes. Ainsworth’s DeFT framework warns that multiple views help only when their relationship is learnable.[web:289]
6. **Make the learner generate a representation:** asking players to draw or reconstruct a system can improve understanding, including for invisible features.[web:294]
7. **Fade assistance:** start with highlighted paths, then require learners to infer them from logs and system behavior.

---

## 5. Session length, spacing, and repetition

| Question | Evidence | Practical conclusion |
|---|---|---|
| **Is there an optimal session length?** | I found no robust consensus establishing a universal number for adult self-directed skill learning. Session-duration claims such as “exactly 5–10 minutes” are highly dependent on task, population, and what counts as learning. | Do not make “eight steps” or “ten minutes” a pedagogical constant. Let a scenario end at a meaningful system resolution: diagnosis, repair, verification, and brief reflection. |
| **Does spacing work?** | Cepeda and colleagues’ meta-analysis covered 839 assessments from 317 experiments and found that spaced presentations generally improve final retention; the best gap increases with the intended retention interval.[web:46] | Revisit each concept across days or weeks, rather than exhausting it in one topic sequence. |
| **Does spacing work in self-directed online learning?** | In an introductory-psychology MOOC, learners’ naturally distributed study was associated with better end-of-unit performance, including within-person comparisons. The benefit was greatest for lower-ability learners and those less likely to complete activities.[web:463] | Schedule returns to prior systems automatically; do not rely on motivated users to choose review. This MOOC result is correlational, not a randomized causal estimate. |
| **Does it work for adults and professionals?** | A review of spaced digital education for health professionals found an advantage over massed online education for knowledge, SMD \(=.32\), and for clinical behavior change, SMD \(=.67\).[web:453] A medical spaced-education experiment still detected an advantage two years later, effect size \(=.35\).[web:462] | Adult professional learning benefits from spaced scenarios. Evidence is strongest in health education, so the exact magnitude should not be assumed for software skills. |
| **How should repetition work?** | Spaced retrieval is better than massed retrieval, \(g=.74\), while expanding intervals were not reliably superior to uniform intervals.[web:49] | Repeat the decision, not the wording. Uniform or adaptively scheduled returns are defensible; an elaborate expanding algorithm is not required. |
| **Does retrieval transfer?** | Pan and Rickard found an overall transfer effect of \(d=.40\), with stronger effects for elaborated retrieval, overlapping underlying responses, and good initial success.[web:56] | Ask learners to reconstruct a recovery command, choose evidence, explain a diagnosis, or perform the operation—not repeatedly identify the same definition. |
| **Should scenarios vary?** | Bjork and Bjork identify variation and interleaving, alongside spacing and testing, as desirable difficulties that can improve long-term learning and transfer.[web:33] | Reuse the same principle in different skins: Git rollback, database restore, deployment rollback, and secret revocation should share a “recover from a known good state” model. |
| **One long game session or several?** | Serious-game learning was stronger when training occurred over multiple sessions and when games were combined with supplementary instruction.[web:467] | Design episodes that can stand alone but alter a persistent campaign state. A later episode should require an earlier skill without announcing which one. |

A defensible cadence is therefore:

- short enough to complete one meaningful diagnose–act–observe–repair loop;
- multiple such loops per concept;
- revisit after roughly a day, several days, and later weeks;
- vary surface context while preserving the underlying decision;
- use delayed retrieval before giving hints;
- provide corrective feedback after the attempt.

The **spacing pattern** is evidence-based; a fixed universal number of minutes is not.

---

## 6. Duolingo: proficiency evidence versus streak evidence

Duolingo provides evidence that sustained use of its courses can produce language gains, especially at beginner levels. It does **not** provide evidence that streaks or XP themselves cause those proficiency gains.

| Evidence | Result | Substantive limitation or criticism |
|---|---|---|
| **Jiang, Rollinson, Plonsky, Gustafson & Pajak (2021), Foreign Language Annals** | Learners completing beginning Spanish reached ACTFL Intermediate Low in reading and approximately Novice High in listening; results were compared with fourth-semester university students.[web:376][web:377] | Speaking and writing were not assessed. Learners were selected because they had already completed substantial course content; the design did not randomly assign streaks, XP, or Duolingo versus no learning. |
| **Later intermediate-course study** | A sample of 340 eligible Spanish and French learners completing seven units achieved intermediate reading/listening scores comparable to fifth-semester university students.[web:390] | It was cross-sectional rather than a longitudinal pretest/post-test design and assessed only receptive skills; its report explicitly acknowledges those limitations.[web:378] |
| **Smith, Jiang & Peters (2024), Language Learning & Technology** | Forty-eight independent Spanish learners studied for about 27 hours across three months and improved significantly in reading, listening, speaking, writing, vocabulary, grammar, pronunciation, and overall proficiency.[web:391] | The study had a small sample and no non-Duolingo control group; 30% of participants left or were removed, leaving a particularly engaged completer sample.[web:386] |
| **Loewen et al. (2019), ReCALL** | An independent case study found measurable Turkish gains after a semester of Duolingo use.[web:361] | The final sample was only nine learners, so it is evidence that learning can occur, not a reliable estimate of comparative effectiveness.[web:363] |
| **2026 French comparison study** | Duolingo-only, classroom-only, and combined groups all improved across nearly all measures with generally similar magnitudes; the combined condition had an advantage for the pragmatic distinction between *tu* and *vous*.[web:375] | The study reports substantial attrition and was funded through Duolingo’s efficacy-research program.[web:388] It supports approximate beginner-level comparability, not the causal efficacy of gamification. |
| **Duolingo’s streak experiments** | Learners reaching a seven-day streak were 2.4 times as likely to return the next day. Separating streak mechanics increased day-14 retention by 3.3%, daily active learners by 1%, and the share of daily learners on a streak by 10.5%.[web:406] | The outcomes are return rate, daily activity, and streak prevalence—not reading, listening, speaking, writing, delayed retention, or transfer. The 2.4× comparison is also observational and subject to self-selection. |
| **XP, points and leaderboards** | These features clearly provide goals, immediate feedback, social comparison, and incentives to complete more lessons. General gamification research supports effects on performance quantity and participation.[web:318] | I found **no peer-reviewed randomized study showing that assigning Duolingo streaks, XP, leagues, or badges causes greater standardized language proficiency than presenting the same exercises without those rewards**. |
| **Frequency versus raw time** | A six-month independently conducted study funded by a Duolingo efficacy grant found total minutes correlated with written but not oral gains; frequency and curriculum-oriented measures were more dependable correlates.[web:384] | Correlation does not establish whether frequent use caused proficiency, whether stronger learners returned more often, or whether streak mechanics caused the frequency. |
| **Broader review of Duolingo gamification** | A review found a mixed and sometimes negatively skewed picture for sustained engagement, motivation, and foreign-language performance.[web:5] | Many studies use convenience samples, self-reports, course-completer samples, short interventions, or app-specific tests, and relatively few measure spontaneous communication or long-delayed proficiency. |

### The fair conclusion on Duolingo

1. **Yes, people can learn real language skills with Duolingo.** The strongest evidence is for beginner/intermediate reading and listening, with newer smaller studies also finding productive-skill gains.[web:376][web:391]
2. **The “equivalent to four or five university semesters” headline is narrower than it sounds.** It refers principally to standardized reading/listening scores among course completers, not equivalence in conversation, writing, cultural competence, instructional breadth, or dropout-adjusted outcomes.[web:376][web:378]
3. **Streaks have genuine evidence as habit and product-retention devices.** Duolingo’s experiments measure return behavior and daily activity.[web:406]
4. **There is no demonstrated causal chain from streak/XP → greater proficiency.** Proficiency studies assess the entire adaptive course; streak studies assess engagement metrics.
5. **The central criticism is not “Duolingo teaches nothing.”** It is that the company and popular coverage sometimes slide from evidence that *completers score well on selected skills* to a broader claim that *the gamified model itself produces comprehensive proficiency efficiently*.

---

## Design implication for your game

Replace the 48 identical quiz sequences with a smaller number of **persistent simulated systems**:

- a repository with working tree, commits, branches, remotes, and backups;
- a database with schema, data, migrations, transactions, snapshots, and users;
- a permission/security graph with identities, roles, secrets, logs, and attack paths;
- a deployment pipeline with versioned artifacts, tests, environments, approvals, monitoring, and rollback.

Every topic should change one of those systems. The core loop should be:

**predict → act → observe hidden state become visible → experience bounded consequence → diagnose → recover → install prevention → encounter the principle later in a different context.**

Points can summarize performance afterward, but the actual “game” should be the operation, failure, and repair of the system.

Citations:
[16] https://scispace.com/papers/the-gamification-of-learning-a-meta-analysis-37l2w5wxcd
[17] https://www.deutsche-digitale-bibliothek.de/item/JSDJCAKSDBROZMEKGCZHNT7P2IXPCDDW
[18] https://wb-web.de/aktuelles/gamification-in-der-weiterbildung-evidenzbasierte-ergebnisse-und-praxistipps.html
[19] https://scholarsmine.mst.edu/cgi/viewcontent.cgi?article=9073&context=masters_theses
[20] https://itl2tlfa16.wordpress.com/wp-content/uploads/2016/08/hanusfox_15.pdf
[21] https://files.eric.ed.gov/fulltext/EJ1452851.pdf
[22] https://pdfs.semanticscholar.org/31b1/60a51d9dff8310c4ccf5ca06ad0bb285975e.pdf
[23] https://www.semanticscholar.org/paper/The-Gamification-of-Learning:-a-Meta-analysis-Sailer-Homner/be6769b967370c9852210e2fb7a34e499902f814
[24] https://smhp.psych.ucla.edu/pdfdocs/gamil.pdf
[25] https://repository.arizona.edu/bitstream/handle/10150/556222/GamificationinEducation.pdf?sequence=1&isAllowed=y
[26] https://pmc.ncbi.nlm.nih.gov/articles/PMC10591086/
[27] https://www.semanticscholar.org/paper/Assessing-the-effects-of-gamification-in-the-A-on-Hanus-Fox/dff76a9862467d426113ec530f83942016ae3a97
[28] https://ai.updf.com/paper-detail/assessing-the-effects-of-gamification-in-the-classroom-a-longitudinal-hanus-fox-dff76a9862467d426113ec530f83942016ae3a97
[29] https://educ201.wordpress.com/2014/11/24/assessing-the-effects-of-gamification-in-the-classroom-a-longitudinal-study-on-intrinsic-motivation-social-comparison-satisfaction-effort-and-academic-performance/
[30] https://dialnet.unirioja.es/descarga/articulo/8966615.pdf
[31] https://eric.ed.gov/?id=EJ1308129
[32] https://www.youtube.com/watch?v=Em8FvxtP1Xc
[33] https://bjorklab.psych.ucla.edu/wp-content/uploads/sites/13/2016/04/EBjork_RBjork_2011.pdf
[34] https://www.psychologicalscience.org/observer/desirable-difficulties
[35] https://www.columbia.edu/cu/psychology/metcalfe/PDFs/Metcalfe-BjorkVolSubmitFeb14Final.pdf
[36] https://yiuno.org/learn/concepts/learning-science/desirable-difficulties
[37] https://www.structural-learning.com/post/robert-bjork-teachers-guide-desirable
[38] https://boldscience.org/wp-content/uploads/2025/04/Productive-Failure.pdf
[39] https://escholarship.org/content/qt2174q8h3/qt2174q8h3_noSplash_2946a03d1efecf84f3c4c39c21592157.pdf
[40] https://www.scotthyoung.com/blog/2022/03/15/desirable-difficulties/
[41] https://pmc.ncbi.nlm.nih.gov/articles/PMC4480221/
[42] https://yukaichou.com/gamification-analysis/desirable-difficulties-bjork-learning-vs-performance/
[43] https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-introducing-desirable-difficulties-into-practice-and-instruction-bjork-and-bjork.pdf
[44] https://www.mindomax.com/desirable-difficulties
[45] https://www.youtube.com/watch?v=gtmMMR7SJKw
[46] https://pubmed.ncbi.nlm.nih.gov/16719566/
[47] https://notes.andymatuschak.org/zC1oBp6yE72b7YHzaJZmjXf
[48] https://www.scribd.com/document/708929801/cepeda2006
[49] http://www.lscp.net/persons/ramus/docs/EPR20.pdf
[50] https://notes.andymatuschak.org/zRTw8KaPErhSCyC2NYGHyP7
[51] https://www.iniciativaeducacao.org/en/ed-on/articles/latest-science/four-strategies-to-boost-students-transfer-and-application-of-their-knowledge-to-new-contexts
[52] https://www.yorku.ca/ncepeda/publications/CCRWMP2009.pdf
[53] https://pmc.ncbi.nlm.nih.gov/articles/PMC12189222/
[54] https://www.yorku.ca/ncepeda/publications/WKWKKF2019.pdf
[55] https://digitalpromise.org/2019/05/08/ask-the-cognitive-scientist-distributed-practice/
[56] https://pubmed.ncbi.nlm.nih.gov/29733621/
[57] https://onlinelibrary.wiley.com/doi/full/10.1002/acp.3796
[58] https://www.yorku.ca/ncepeda/publications/KWWR2019.pdf
[59] https://www.learningscientists.org/blog/2017/2/9-1
[60] https://www.nature.com/articles/s41539-019-0053-1
[1] https://www.dpublication.com/wp-content/uploads/2024/09/385%20-WOR.pdf
[2] https://eric.ed.gov/?id=EJ1325291
[3] https://dspace.jaist.ac.jp/dspace/bitstream/10119/15292/1/24026.pdf
[4] https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_language_read_listen_A1_to_A2_2022.pdf
[5] https://www.tandfonline.com/doi/full/10.1080/09588221.2021.1933540
[6] https://www.diva-portal.org/smash/get/diva2:1766390/FULLTEXT02
[7] https://www.scribd.com/document/747854439/Case-Study-1-Duolingo-in-Mobile-Assisted-Language-Learning-Loewen-et-al-2019
[8] https://pkm.uika-bogor.ac.id/index.php/best/article/view/2964
[9] https://utppublishing.com/doi/10.1558/cj.26704
[10] https://www.scribd.com/document/727826895/assignment-week-5-sila-celebi
[11] https://ejournal.upi.edu/index.php/CURRICULA/article/download/75706/pdf_en
[12] https://files.eric.ed.gov/fulltext/EJ1135889.pdf
[13] https://scholarspace.manoa.hawaii.edu/items/140c6a0c-0035-4c87-b678-a0d74dd53de3
[14] https://pmc.ncbi.nlm.nih.gov/articles/PMC12781743/
[15] https://hiwavemakers.com/blog/gamification-learning-apps-backfire-kids-research/
[76] https://pt.scribd.com/document/408226801/Shenzhen-Io-Manual-01-41-en-pt
[77] https://github.com/archsyril/tis100-manual
[78] https://pdfcoffee.com/shenzhen-io-manual-pdf-free.html
[79] https://www.youtube.com/watch?v=Av3ZZAiA0n4
[80] https://www.scribd.com/document/332195251/Shenzhen-Io-Manual
[81] https://anyflip.com/rsze/cqwt/basic
[82] https://kk4ead.github.io/tis-100/
[83] https://steamcommunity.com/sharedfiles/filedetails/?id=1437899653
[84] https://github.com/goodsoul/learningpython/blob/master/TIS-100%20Reference%20Manual.pdf
[85] https://en.namu.wiki/w/SHENZHEN%20I/O
[86] https://steamcommunity.com/app/504210/guides/
[87] https://archive.org/details/Tis-100
[88] https://www.scribd.com/document/326739184/Shenzhen-Io-Manual
[89] https://github.com/nsmaciej/TIS-100/blob/main/README.md
[90] https://www.rockpapershotgun.com/what-works-and-why-opus-magnum
[61] https://www.sciencedirect.com/science/article/abs/pii/S1875952119300059
[62] https://nti.khai.edu/ojs/index.php/aktt/article/view/2743
[63] https://portal.sinteza.singidunum.ac.rs/Media/files/2026/81-85.pdf
[64] https://www.arxiv.org/abs/2508.13259
[65] https://search.informit.org/doi/10.3316/informit.068688411275167
[66] https://digitalcommons.usu.edu/smallsat/2023/all2023/278/
[67] https://sowi.rptu.de/en/fgs/paedagogik/forschung/projekte-ag-paedagogik/abgeschlossene-projekte/researching-digital-games/research/human-resource-machine
[68] https://www.universetoday.com/articles/how-kerbal-space-program-is-inspiring-real-mission-designs
[69] https://ar5iv.labs.arxiv.org/html/2503.09617
[70] https://hal.science/hal-01753302v1/document
[71] https://dl.acm.org/doi/10.1145/3449726.3459463
[72] https://learningcorner.co/activity/281623
[73] https://www.universityxp.com/news/2024/7/8/integrating-learning-with-gameplay-in-human-resource-machine
[74] https://www.youtube.com/watch?v=Umpx8UhQPxY
[75] http://digitalrepository.cipmlk.org/bitstream/handle/1/746/5.3%20Algorithmic%20human%20resource%20management%20Synthesizing%20developments%20and%20cross%20disciplinary%20insights%20on%20digital%20HRM.pdf?sequence=1&isAllowed=y
[106] https://shapes.inc/fandom/return-of-the-obra-dinn/fate-mechanics
[107] https://www.reddit.com/r/ObraDinn/comments/150fhvn/help_regarding_fates/
[108] https://www.youtube.com/watch?v=vptDZtdYOtI
[109] https://obradinn.fandom.com/wiki/General
[110] https://steamcommunity.com/app/653530/discussions/0/1810919208220529328/
[111] https://www.reddit.com/r/ObraDinn/comments/wwep32/isnt_the_game_supposed_to_tell_you_if_you_get_3/
[112] https://www.reddit.com/r/ObraDinn/comments/18qsb34/new_to_the_game_seeking_some_clarification_on_the/
[113] https://www.youtube.com/watch?v=7ZKZlMLSz4Q
[114] https://psnprofiles.com/guide/15541-return-of-the-obra-dinn-trophy-guide
[115] https://www.youtube.com/watch?v=z32jTDjFSJs
[116] https://en.wikipedia.org/wiki/Return_of_the_Obra_Dinn
[117] https://intermittentmechanism.blog/2024/05/21/confirmation-in-the-return-of-obra-dinn/
[118] https://mechanicsofmagic.com/2026/05/15/playing-papers-please-success-in-creating-emotional-and-moral-distance/
[119] https://www.reddit.com/r/patientgamers/comments/1gjd93l/return_to_the_return_of_the_obra_dinn/
[120] https://filmstories.co.uk/features/exploring-return-of-the-obra-dinns-rule-of-three/
[91] https://arxiv.org/html/2506.19095v1
[92] https://terra-docs.s3.us-east-2.amazonaws.com/IJHSR/Articles/volume5-issue7/IJHSR_2023_57_140.pdf
[93] http://arxiv.org/pdf/2407.13729.pdf
[94] https://www.sciencedirect.com/science/article/abs/pii/S0360131524000563
[95] https://www.gamedeveloper.com/design/designing-i-baba-is-you-i-s-delightfully-innovative-rule-writing-system
[96] https://cejsh.icm.edu.pl/cejsh/element/bwmeta1.element.desklight-88950ea2-9eaf-4616-843c-5518c4491d6a/c/AL_2024-7-SI_Study-1_Horvath.pdf
[97] https://educationaldatamining.org/EDM2023/proceedings/2023.EDM-demonstrations.62/2023.EDM-demonstrations.62.pdf
[98] https://www.erudit.org/en/journals/loading/2021-v14-n24-loading06644/1092134ar.pdf
[99] https://learninganalytics.upenn.edu/ryanbaker/ICQE23_paper_25.pdf
[100] https://en.wikipedia.org/wiki/Baba_Is_You
[101] https://escholarship.org/content/qt1xr7s6z2/qt1xr7s6z2.pdf?v=lg
[102] https://babaiswiki.fandom.com/wiki/Rule
[103] https://steamcommunity.com/sharedfiles/filedetails/?id=2725290821
[104] https://babaiswiki.fandom.com/wiki/Advanced_rulebook
[105] https://babaisyou.net/baba-is-you-guide-rules
[136] https://digitalst0rytelling.wordpress.com/2016/02/19/vigilance-in-papers-please/
[137] https://www.youtube.com/watch?v=YYqJdd0gwBs
[138] https://sol.sbc.org.br/index.php/sbgames_estendido/article/view/19620
[139] https://publications.scss.tcd.ie/theses/diss/2014/TCD-SCSS-DISSERTATION-2014-033.pdf
[140] https://read.dukeupress.edu/american-literature/article-abstract/94/1/181/294055/Gaming-Borders-The-Rhetorics-of-Gamification-and
[141] https://www.academia.edu/127249530/Textual_Analysis_on_Ethical_Dilemmas_and_Individual_Morality_Through_Aesthetics_and_Mechanics_in_Papers_Please
[142] https://www.academia.edu/37932617/Game_analysis_Papers_Please_Authority_vs_Moral
[143] https://www.academia.edu/32215276/Procedural_Rhetorics_of_Papers_Please
[144] https://papersplease.fandom.com/wiki/Inspection_mode
[145] https://medium.com/@gbs/how-to-ace-papers-please-ebfa0bb60062
[146] https://steamcommunity.com/app/239030/discussions/0/34094415864011994/
[147] https://en.wikipedia.org/wiki/Papers,_Please
[148] https://research.bangor.ac.uk/en/publications/glory-to-trumpland-misplay-as-protest-in-immigration-games
[149] https://fr.wikipedia.org/wiki/Papers,_Please
[150] https://philarchive.org/archive/FORPPA-13
[121] https://www.youtube.com/watch?v=EFvbN3K6EA8
[122] https://www.herstorygame.com/about/
[123] https://www.jrspelt.com/wp-content/uploads/2025/09/jrspelt951005.pdf
[124] https://medium.com/@carson.katri/developing-compelling-game-narratives-tips-from-sam-barlow-her-story-42f8ede9237
[125] https://www.vice.com/en/article/watching-as-detectives-the-truth-behind-her-story-400/
[126] https://en.wikipedia.org/wiki/Her_Story_(video_game)
[127] https://www.pocketgamer.biz/making-of-her-story/
[128] https://www.gamedeveloper.com/audio/road-to-the-igf-sam-barlow-s-i-her-story-i-
[129] https://kinglink-reviews.com/2020/09/01/her-story-design-review-revisiting-one-of-the-best-video-game-stories-of-all-time/
[130] https://www.theguardian.com/technology/2015/feb/27/her-story-computer-game-true-detective-meets-google
[131] https://www.diva-portal.org/smash/get/diva2:2077985/ATTACHMENT01.pdf
[132] https://www.appunwrapper.com/2015/06/24/her-story-walkthrough-guide/
[133] https://store.steampowered.com/app/368370/Her_Story/?l=english&curator_clanid=31194080
[134] https://www.nataliemarinho.com/blog/playing-her-story
[135] https://app.famitsu.com/20161207_910729/
[166] https://www.youtube.com/watch?v=lM0UqYWFnWg
[167] https://dl.acm.org/doi/10.1145/3449726.3459463
[168] https://wiki.factorio.com/Tutorial:Transport_use_cases
[169] https://wiki.factorio.com/pollution
[170] https://arxiv.org/pdf/2102.04871.pdf
[171] https://wiki.factorio.com/Pollution/ru
[172] https://wiki.factorio.com/Pollution/uk
[173] https://pmc.ncbi.nlm.nih.gov/articles/PMC7936226/
[174] https://forums.factorio.com/viewtopic.php?t=1677
[175] https://www.youtube.com/watch?v=VltToXyFJS8
[176] https://arxiv.org/abs/2503.09617
[177] https://www.reddit.com/r/factorio/comments/479xdm/how_exactly_does_the_pollution_mechanic_work/
[178] https://steamcommunity.com/sharedfiles/filedetails/?id=654782457
[179] https://www.tandfonline.com/doi/full/10.1080/03043797.2025.2577263
[180] https://www.sciencedirect.com/science/article/pii/S1871187117302511
[151] https://www.reddit.com/r/learnprogramming/comments/1f13fjn/can_you_learn_legitimate_programming_skills_by/
[152] https://steamcommunity.com/discussions/forum/0/1638669204747266431/
[153] https://www.gamespark.jp/article/2019/07/04/91132.html
[154] http://perimosocordiae.github.io/articles/pyhrm.html
[155] https://www.zachtronics.com/zachademics/
[156] https://www.zachtronics.com/
[157] https://puzzlebyrinth.com/en/articles/zachtronics-programming-puzzle-grammar
[158] https://www.scmb.xyz/post/learn-through-games/
[159] https://en.wikipedia.org/wiki/Zachtronics
[160] https://www.zachtronics.com/zach-like/
[161] https://forum.canardpc.com/archive/index.php/t-116256.html
[162] https://www.youtube.com/watch?v=o99hbZy8CuE
[163] https://psycnet.apa.org/record/2023-18798-013
[164] https://rsdjournal.org/rsd/article/view/8053
[165] https://news.ycombinator.com/item?id=17748220
[211] https://www.reddit.com/r/opus_magnum/comments/o9dsap/question_regarding_the_histogram/
[212] https://www.youtube.com/watch?v=1VqY1w9BuVY
[213] https://www.youtube.com/watch?v=D89ql46gvCk
[214] https://gaming.stackexchange.com/questions/356083/how-is-the-area-stat-calculated
[215] https://github.com/talon-ward/Opus-Magnum-Solutions
[216] https://www.reddit.com/r/opus_magnum/comments/7scj7i/official_record_submission_thread/
[217] https://biggieblog.com/tracking-the-global-opus-magnum-records/
[218] https://zlbb.faendir.com/help
[219] https://steamcommunity.com/app/558990/discussions/0/3109142236146697165/?l=japanese
[220] https://steamcommunity.com/app/558990/discussions/0/1480982971159216710/
[221] https://steamcommunity.com/app/558990/discussions/0/3419934814465123324/?l=polish
[222] https://steamcommunity.com/app/558990/discussions/0/3040479910548702485/?l=japanese
[223] https://opus-magnum.fandom.com/wiki/Reconstructed_Solvent
[224] https://www.reddit.com/r/opus_magnum/wiki/index/
[225] https://ermsta.com/posts/20240506
[181] https://www.zachtronics.com/tis-100/
[182] https://en.wikipedia.org/wiki/TIS-100
[183] https://steamcommunity.com/sharedfiles/filedetails/?id=1437899653
[184] https://alandesmet.github.io/TIS-100-Hackers-Guide/assembly.html
[185] https://www.reddit.com/r/tis100/comments/391heb/table_of_lowest_cyclesnodesinstructions/
[186] https://www.rockpapershotgun.com/shenzen-io-steam-early-access-by-spacechem-dev
[187] https://steamcommunity.com/app/370360/discussions/0/598198356162860062/?l=finnish
[188] https://steamcommunity.com/app/370360/discussions/0/618463738402920575/?l=schinese
[189] https://en.wikipedia.org/wiki/Shenzhen_I/O
[190] https://www.youtube.com/watch?v=TxJVH5TZQFY
[191] https://www.rockpapershotgun.com/spacechem-tis-100-dev-announces-shenzen-io
[192] https://www.zachtronics.com/
[193] https://www.youtube.com/watch?v=7WBDByzPd9c
[194] https://zachtronics.fandom.com/wiki/TIS-100
[195] https://en.namu.wiki/w/SHENZHEN%20I/O
[226] https://pubmed.ncbi.nlm.nih.gov/18211135/
[227] https://psycnet.apa.org/record/2008-00266-004
[228] https://www.semanticscholar.org/paper/Effectiveness-of-error-management-training:-a-Keith-Frese/c195b7122329166ff735d50d4157bc79a4fad3ff
[229] https://corescholar.libraries.wright.edu/cgi/viewcontent.cgi?article=1441&context=etd_all
[230] https://note.com/harami014/n/n5878c9a6a239?hl=en
[231] https://medschool.cuanschutz.edu/docs/librariesprovider31/ofe/ofd/theory-corners/theory-corner-24-10-error-management-training.pdf?sfvrsn=11fd33b4_1
[232] http://www.evidence-based-entrepreneurship.com/content/news/2008/learning_from_errorr_APS_Chicago.pdf
[233] https://www.mobt3ath.com/uplode/book/book-113668.pdf
[234] https://jasonhuangatwork.com/papers/Blume%20Ford%20Baldwin%20Huang%202010%20JOM%20-%20Transfer%20Meta.pdf
[235] https://scispace.com/pdf/effectiveness-of-error-management-training-a-meta-analysis-2291y097lc.pdf
[236] https://www.humanw.tu-darmstadt.de/media/orgpsy/selfregulationinerrormanagement.pdf
[237] https://2024.sci-hub.box/3434/bcf3ab0cf0fddd5003722339c7589913/10.1146@annurev-psych-010814-015205.pdf
[238] https://scholarworks.umt.edu/cgi/viewcontent.cgi?article=13099&context=etd
[239] https://sapientia.pucsp.br/handle/handle/23794
[240] https://www.sciencedirect.com/science/article/pii/S2589871X21000772
[196] https://eurodljournal.com/articles/10.1515/eurodl-2016-0004
[197] https://www.jotse.org/index.php/jotse/article/view/1752/730
[198] https://eric.ed.gov/?id=ED592723
[199] https://ir.library.illinoisstate.edu/cgi/viewcontent.cgi?article=2636&context=etd
[200] https://olj.onlinelearningconsortium.org/index.php/olj/article/view/2810
[201] https://files.eric.ed.gov/fulltext/EJ1428277.pdf
[202] https://pmc.ncbi.nlm.nih.gov/articles/PMC9197481/
[203] https://files.eric.ed.gov/fulltext/ED593115.pdf
[204] https://jurnal.untirta.ac.id/index.php/JELS/article/download/10746/7742
[205] https://eric.ed.gov/?id=EJ940001
[206] https://www.sciencedirect.com/science/article/pii/S2212868925000017
[207] https://www.sciencedirect.com/science/article/abs/pii/S1096751624000101
[208] https://pmc.ncbi.nlm.nih.gov/articles/PMC11955628/
[209] https://digitalcommons.odu.edu/cgi/viewcontent.cgi?article=1181&context=stemps_fac_pubs
[210] https://www.irrodl.org/index.php/irrodl/article/view/2581/3962
[241] https://vtechworks.lib.vt.edu/server/api/core/bitstreams/077597fe-b93c-4ea9-abcd-6c8ef8f64591/content
[242] https://deepwiki.com/git-learning-game/oh-my-git
[243] https://deepwiki.com/git-learning-game/oh-my-git/4.1-basic-git-concepts
[244] https://ohmygit.org/
[245] https://github.com/pcottle/learnGitBranching
[246] https://lennartwittkuhn.com/version-control-book/chapters/branches.html
[247] https://www.mdpi.com/2079-9292/13/24/4956
[248] https://www.youtube.com/watch?v=mjfzJiFz5b4
[249] https://generalistprogrammer.com/tutorials/git-version-control-game-development-complete-guide
[250] https://about.gitlab.com/blog/git-resources-for-visual-learners/
[251] https://www.youtube.com/watch?v=M_TUYZsv4-E
[252] https://www.oreilly.com/library/view/git-essentials/9781787120723/98539fbc-ec3c-4316-8e39-ffeaa5f08d98.xhtml
[253] https://devblogs.microsoft.com/visualstudio/multi-branch-graph-available-for-general-audiences/
[254] https://web.engr.oregonstate.edu/~sarmaa/wp-content/uploads/2020/08/2993283.2993285.pdf
[255] https://www.youtube.com/watch?v=kRoDRyXomJI
[256] https://www.pcgamer.com/hacknet-celebrates-third-anniversary-with-educational-pricing-plan/
[257] https://www.youtube.com/watch?v=32YLaVQ9Bwo
[258] https://www.teachthought.com/technology/hacknet-education-hacking-simulator/
[259] https://www.sciencedirect.com/science/article/pii/S2307187725006698
[260] https://www.reddit.com/r/cybersecurity/comments/11qp5ff/message_to_all_newcomers_and_hobbyists_play_this/
[261] https://fellowtraveller.itch.io/hacknet-edicational-license
[262] https://bpsfanfare.com/8940/columns/hacknet-review/
[263] https://steamcommunity.com/app/365450/discussions/0/1835685838080733290/?l=thai
[264] https://www.youtube.com/watch?v=MoWM9NhHtn4
[265] https://www.reddit.com/r/Hacknet/comments/1qgapeh/what_can_i_learn_from_game/
[266] https://www.youtube.com/watch?v=-ZHZ-udGKjw
[267] https://steamcommunity.com/app/365450/discussions/0/350533172677942775/?l=ukrainian
[268] https://steamcommunity.com/app/365450/discussions/0/2963890181171914689/
[269] https://www.arxiv.org/abs/2508.17414
[270] https://www.youtube.com/watch?v=fyg_LC14Tmc
[286] https://ris.utwente.nl/ws/portalfiles/portal/194790530/Demetriadis_Kaleidoscope_2004.pdf
[287] https://oro.open.ac.uk/34586/1/2001%20-%20Applying%20the%20DeFT%20Framework%20(AIED).pdf
[288] https://eric.ed.gov/?id=EJ608444
[289] https://nottingham-repository.worktribe.com/output/23577631
[290] https://www.iwm-tuebingen.de/workshops/visualization/ainsworth.pdf
[291] https://www.semanticscholar.org/paper/DeFT:-A-Conceptual-Framework-for-Considering-with-Ainsworth/fa0c51c4aff32745a6f937e8a30615420b290772
[292] https://learning-analytics.info/index.php/JLA/article/view/5271/6099
[293] https://www.scribd.com/document/559231898/Ainsworth-1999
[294] https://pmc.ncbi.nlm.nih.gov/articles/PMC5256450/
[295] http://ndl.ethernet.edu.et/bitstream/123456789/23230/1/David%20F.%20Treagust_2017.pdf
[296] https://www.sciencedirect.com/science/article/abs/pii/S0959475206000259
[297] https://hd.media.mit.edu/tech-reports/TR-546.pdf
[298] https://www.sussex.ac.uk/informatics/cogslib/reports/csrp/csrp335.pdf
[299] https://sites.psu.edu/wcfellows/2018/09/05/research-review-s-ainsworth-2006/
[300] https://www.sciencedirect.com/science/article/abs/pii/S0959475212001065
[271] https://dl.acm.org/doi/10.1145/3427597
[272] https://ir.canterbury.ac.nz/server/api/core/bitstreams/e1d560ee-f4dd-438a-9370-c14625bdc718/content
[273] https://www.scitepress.org/Papers/2023/119564/119564.pdf
[274] https://ixdea.org/wp-content/uploads/IxDEA_art/63/63_8.pdf
[275] http://penta3.ufrgs.br/RENOTE/RENOTE-2024-1/Artigos/240366.pdf
[276] https://ir.canterbury.ac.nz/server/api/core/bitstreams/1a2763bc-ba98-4cfa-b11d-d2cffc7942ca/content
[277] https://ec.europa.eu/programmes/erasmus-plus/project-result-content/6b85cd63-4190-4bcf-a7fe-20e17bf7d813/PDF_Experiences_and_perceptions_of_pedagogical_practices_with_Games.pdf
[278] https://www.arxiv.org/pdf/2410.16120.pdf
[279] https://bsi.uniriotec.br/wp-content/uploads/sites/31/2023/09/202307GabrielJansen_e_RenanHatherly.pdf
[280] https://d-nb.info/1382626150/34
[281] https://ceur-ws.org/Vol-3061/ERIS_2021-art09(reg).pdf
[282] https://arxiv.org/pdf/2012.02237.pdf
[283] https://ojs.elte.hu/cejntrep/article/download/12228/10556
[284] https://rsisinternational.org/journals/ijrsi/uploads/vol13-iss2-pg421-428-202602_pdf.pdf
[285] https://soar.suny.edu/bitstream/handle/20.500.12648/951/Ward2015SQL.pdf?sequence=1&isAllowed=y
[316] https://dl.acm.org/doi/10.1145/2583008.2583017
[317] https://hcds.itu.dk/bibliography/mekler2013points.html
[318] https://bibbase.org/network/publication/mekler-brhlmann-tuch-opwis-towardsunderstandingtheeffectsofindividualgamificationelementsonintrinsicmotivationandperformance-2017
[319] https://www.studeersnel.nl/nl/document/universiteit-utrecht/mk-risicogedrag/2583008/10603896
[320] https://www.semanticscholar.org/paper/Do-points,-levels-and-leaderboards-harm-intrinsic-Mekler-Br%C3%BChlmann/0633ab1b7842f166a3197877cdd3dd46ea849794
[321] https://ink.library.smu.edu.sg/context/sis_research/article/10979/viewcontent/978_3_319_91716_0_35_pvoa.pdf
[322] https://hub.hku.hk/handle/10722/223925
[323] https://scispace.com/papers/towards-understanding-the-effects-of-individual-gamification-47a64t5saf
[324] https://www.mmi-basel.ch/projects/07-gamification.html
[325] https://scispace.com/authors/florian-bruhlmann-3wulg36utd
[326] https://www.growingscience.com/ijds/Vol8/ijdns_2023_181.pdf
[327] https://journals.sagepub.com/doi/pdf/10.1177/1046878114563660
[328] https://scholars.hkmu.edu.hk/en/publications/do-points-badges-and-leaderboard-increase-learning-and-activity-a/
[329] https://www.mmi-basel.ch/MA/2021_Saraceno.pdf
[330] https://econpapers.repec.org/article/saesimgam/v_3a52_3ay_3a2021_3ai_3a4_3ap_3a407-434.htm
[331] https://www.growingscience.com/ijds/Vol8/ijdns_2023_181.pdf
[332] https://pmc.ncbi.nlm.nih.gov/articles/PMC10591086/
[333] https://www.sciencedirect.com/science/article/abs/pii/S1747938X19302908
[334] https://www.sciencedirect.com/science/article/pii/S2444569X24000696
[335] https://openpsychologyjournal.com/VOLUME/18/ELOCATOR/e18743501359379/FULLTEXT/
[336] https://www.scribd.com/document/948626909/1597-Article-Text-10011-1-10-20250117
[337] https://scholarspace.manoa.hawaii.edu/bitstreams/ba9fd7c6-3085-47eb-aabe-147f306b160e/download
[338] https://www.studocu.vn/vn/document/truong-dai-hoc-khoa-hoc-xa-hoi-va-nhan-van/ppnckh/gamification-in-education-a-systematic-review-of-empirical-evidence-edu-2020/162099852
[339] https://d-nb.info/1309619018/34
[340] https://www.mdpi.com/2227-7102/14/6/639
[341] https://files.eric.ed.gov/fulltext/EJ1470329.pdf
[342] https://research.tue.nl/en/publications/a-meta-analysis-of-the-cognitive-and-motivational-effects-of-seri/
[343] https://www.sciencedirect.com/science/article/abs/pii/S074756322030145X
[344] https://www.sciencepublishinggroup.com/article/10.11648/j.si.20231101.11
[345] https://gosu-upskill.com/insights/gamified-training-statistics
[346] https://karlkapp.com/two-types-of-gamification/
[347] https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2023.1212994/full
[348] https://cdn1.unasp.br/home/2017/11/paper_49942_30741-1.pdf
[349] https://blog.learnlets.com/2012/04/kapps-gamification-for-learning-and-instruction/
[350] https://www.ncolr.org/jiol/issues/pdf/15.1.4.pdf
[351] http://inside.collin.edu/tl/pdfs/facdev/Kapp_Workbook%20v4.pdf
[352] https://pmc.ncbi.nlm.nih.gov/articles/PMC9562056/
[353] https://www.worklearning.com/2016/09/23/interview-with-karl-kapp-on-games-gamification-and-learning/
[354] https://ixdea.org/62_2/
[355] https://cit.iict.bas.bg/CIT_2014/v14-4/7-15-CIT2014-Dichev%20_1_-m-Gotovo.pdf
[356] https://karlkapp.com/wp-content/uploads/2013/01/clo_gamification.pdf
[357] https://files.eric.ed.gov/fulltext/EJ1466168.pdf
[358] https://fr.slideshare.net/slideshow/paideia-as-paidia-from-gamebased-learning-to-a-life-wellplayed/13380785
[359] https://files.eric.ed.gov/fulltext/ED594159.pdf
[360] https://philpapers.org/archive/FODGIE.pdf
[301] https://pubmed.ncbi.nlm.nih.gov/10589297/
[302] https://www.selfdeterminationtheory.org/SDT/documents/2001_DeciKoestnerRyan.pdf
[303] https://www.utupub.fi/bitstreams/30218289-0260-4f62-a723-0c925c4ae0fa/download
[304] https://eric.ed.gov/?id=EJ642243
[305] https://pmc.ncbi.nlm.nih.gov/articles/PMC2731358/
[306] https://openaccess.hacettepe.edu.tr/items/9cefb20f-2127-40aa-aed3-41fc7ced176b
[307] https://scholarworks.uni.edu/cgi/viewcontent.cgi?article=1898&context=grp
[308] https://www.semanticscholar.org/paper/A-meta-analytic-review-of-experiments-examining-the-Deci-Koestner/8ad9801baea65b40fbbe6fc56e34b2b7be47d0ba
[309] https://tipsforteachers.substack.com/p/research-bite-2-extrinsic-rewards
[310] https://www.quadernidicomunita.it/index.php/qdc/article/view/43
[311] https://journal.idscipub.com/index.php/data/article/view/1087
[312] https://link.springer.com/article/10.1007/s12528-023-09358-1
[313] https://hub.hku.hk/handle/10722/348034
[314] https://rsisinternational.org/journals/ijriss/uploads/vol9-iss25-pg282-287-202511_pdf.pdf
[315] https://etd.ohiolink.edu/acprod/odb_etd/ws/send_file/send?accession=kent1667988882889285&disposition=inline
[376] http://static.duolingo.com/s3/DuolingoReport_Final.pdf
[377] https://onlinelibrary.wiley.com/doi/full/10.1111/flan.12600
[378] https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_language_read_listen_A2_to_B1_2022.pdf
[379] https://www.semanticscholar.org/paper/Reading-and-Listening-Outcomes-of-Learners-in-the-Jiang-Pajak/572cfbf9be9701e5f6b8e70b7fa03e9721c3b26c
[380] https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_language_read_listen_write_speak_2024.pdf
[381] https://old.callej.org/journal/23-3/Taylor2022.pdf
[382] https://pmc.ncbi.nlm.nih.gov/articles/PMC12781743/
[383] https://investors.duolingo.com/news-releases/news-release-details/leading-language-research-journal-publishes-study-showing
[384] https://pdfs.semanticscholar.org/1ff4/780566aa77270aad5c93399a2f6d8b503efd.pdf
[385] https://utppublishing.com/doi/10.1558/cj.26704
[386] https://scholarspace.manoa.hawaii.edu/bitstreams/ea47a53e-da6e-4419-bd55-e72b458294f4/download
[387] https://duolingo-papers.s3.amazonaws.com/reports/duolingo-speaking-whitepaper.pdf
[388] https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/comparing-the-effectiveness-of-duolingo-classroom-instruction-and-classroom-duolingo-instruction-conditions-on-beginnerlevel-french-language-development/68C0E7E296669798089C84CDC7F3BB9E
[389] https://discovery.researcher.life/article/the-effectiveness-of-duolingo-english-courses-in-developing-reading-and-listening-proficiency/1069a95c12be3c00ba1f796202771e98
[390] https://blog.duolingo.com/effective-intermediate-learning/
[361] https://eric.ed.gov/?id=EJ1226279
[362] https://www.semanticscholar.org/paper/Mobile-assisted-language-learning:-A-Duolingo-case-Loewen-Crowther/ba6e9156c6549259fe2ed88a6937e1a7058f45cd
[363] https://journals.sagepub.com/doi/10.1177/21582440231193818
[364] https://duolingo-papers.s3.amazonaws.com/reports/duolingo-speaking-whitepaper.pdf
[365] https://pmc.ncbi.nlm.nih.gov/articles/PMC12781743/
[366] https://oulurepo.oulu.fi/bitstream/handle/10024/54117/nbnfioulu-202502121605.pdf?sequence=1&isAllowed=y
[367] https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/ea47a53e-da6e-4419-bd55-e72b458294f4/content
[368] https://callej.org/index.php/journal/article/download/437/493/4151
[369] https://callej.org/index.php/journal/article/download/477/415/1512
[370] https://research.duolingo.com/
[371] http://static.duolingo.com/s3/DuolingoReport_Final.pdf
[372] https://utppublishing.com/doi/10.1558/cj.26704
[373] https://ufdcimages.uflib.ufl.edu/UF/E0/05/73/03/00001/Lye_L.pdf
[374] https://files.eric.ed.gov/fulltext/EJ1332309.pdf
[375] https://www.cambridge.org/core/services/aop-cambridge-core/content/view/68C0E7E296669798089C84CDC7F3BB9E/S0272263126101521a.pdf/comparing_the_effectiveness_of_duolingo_classroom_instruction_and_classroom_duolingo_instruction_conditions_on_beginnerlevel_french_language_development.pdf
[406] https://blog.duolingo.com/improving-the-streak/
[407] https://research.duolingo.com/papers/yancey.kdd20.pdf
[408] https://blog.duolingo.com/how-duolingo-streak-builds-habit/
[409] https://zenodo.org/records/11528881
[410] https://assets.nextleap.app/submissions/DATAANALYSISOFDUALINGO-cfa09e78-96db-4653-9cc7-59f9659c88f4.pdf
[411] https://trophy.so/blog/duolingo-gamification-case-study
[412] https://www.digia.tech/post/duolingo-habit-forming-reminders-retention-architecture/
[413] https://media.licdn.com/dms/document/media/v2/D561FAQHbnYhHFKE_fA/feedshare-document-pdf-analyzed/feedshare-document-pdf-analyzed/0/1729506031004?e=1743638400&v=beta&t=TwMVoqZgr_NaLS_zNEY5Dl4KVKTShAHEf34pbQSFyw8
[414] https://www.academicjobs.com/higher-education-news/how-online-language-learning-streaks-supercharge-user-motivation-and-retention-108
[415] https://blog.langtrack.app/posts/duolingo-stats-explained/
[416] https://duolingo-papers.s3.amazonaws.com/reports/duolingo-efficacy-whitepaper.pdf
[417] https://getnivelo.com/guides/your-duolingo-streak-is-lying
[418] https://www.opencopy.org/blog/language-apps-distraction-duolingo
[419] https://sqmagazine.co.uk/duolingo-statistics/
[420] https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/ea47a53e-da6e-4419-bd55-e72b458294f4/content
[391] https://scholarspace.manoa.hawaii.edu/items/140c6a0c-0035-4c87-b678-a0d74dd53de3
[392] https://www.erudit.org/en/journals/irrodl/2024-v25-n3-irrodl09550/1113492ar.pdf
[393] https://files.eric.ed.gov/fulltext/EJ1424711.pdf
[394] https://www.avantassessment.com/wp-content/uploads/Duolingo-English-Courses-in-Developing-Proficiency.pdf
[395] https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_language_video_call_improves_speaking_2025.pdf
[396] https://duolingo-papers.s3.amazonaws.com/reports/Duolingo_whitepaper_language_read_listen_write_speak_2024.pdf
[397] https://utppublishing.com/doi/10.1558/cj.26704
[398] https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/comparing-the-effectiveness-of-duolingo-classroom-instruction-and-classroom-duolingo-instruction-conditions-on-beginnerlevel-french-language-development/68C0E7E296669798089C84CDC7F3BB9E
[399] https://www.ejels.com/levelling-up-writing-investigating-duolingos-gamification-effect-on-efl-students-writing-skills
[400] https://colab.ws/articles/10.1007%2Fs40692-025-00355-0
[401] https://duolingo-papers.s3.amazonaws.com/reports/RodriguezFuentes_etal_whitepaper_language_proficiency_Columbia_2023.pdf
[402] https://ejournal.upi.edu/index.php/CURRICULA/article/download/75706/pdf_en
[403] https://www.ejeset.saintispub.com/ejeset/article/download/242/42
[404] https://discovery.researcher.life/article/usefulness-of-educational-applications-for-learning-foreign-languages-among-cognitively-unimpaired-older-adults/610919b4c90b391793f51dbe26a95899
[405] https://duolingo-papers.s3.amazonaws.com/reports/duolingo-efficacy-whitepaper.pdf
[436] https://pmc.ncbi.nlm.nih.gov/articles/PMC5126970/
[437] https://publikasi.teknokrat.ac.id/index.php/jurnalmathema/article/download/517/194/
[438] https://pmc.ncbi.nlm.nih.gov/articles/PMC3351401/
[439] https://aicalcus.com/blog/study-time-science
[440] https://psychology.stackexchange.com/questions/3223/what-is-the-upper-bound-on-rate-of-learning-in-young-adults
[441] https://www.mindomax.com/how-long-should-you-study
[442] https://www.psychologytoday.com/us/blog/memory-medic/201504/what-is-the-optimally-efficient-gap-between-study-sessions
[443] https://psychology.stackexchange.com/questions/266/what-is-the-optimal-length-of-a-training-session
[444] https://www.sciencedirect.com/science/article/pii/S2405844024174440
[445] https://rsisinternational.org/journals/ijriss/uploads/vol10-iss26-pg1256-1269-202603_pdf.pdf
[446] https://stridesy.app/research/studies/cepeda-2006-distributed-practice
[447] https://unreliant.com/articles/calculate-perfect-study-session-length-spaced-repetition-attention-span
[448] https://jier.org/index.php/journal/article/download/3922/3100/6898
[449] https://www.scribd.com/document/918470115/Suggest-Optimal-Research-Session-Lengths-and-Break
[450] https://www.clrn.org/how-long-should-study-sessions-be/
[451] https://synapsesocial.com/papers/69a75bb0c6e9836116a237e7
[452] https://pubmed.ncbi.nlm.nih.gov/37683816/
[453] https://pubmed.ncbi.nlm.nih.gov/39388234/
[454] https://pubmed.ncbi.nlm.nih.gov/41601436/
[455] https://onlinelibrary.wiley.com/doi/abs/10.1111/medu.14025
[456] https://pubmed.ncbi.nlm.nih.gov/42468294/
[457] https://newprairiepress.org/cgi/viewcontent.cgi?article=4115&context=aerc
[458] https://pubmed.ncbi.nlm.nih.gov/32578325/
[459] https://pubmed.ncbi.nlm.nih.gov/39250798/
[460] https://www.sciencedirect.com/science/article/abs/pii/S0022534709026408
[461] https://pubmed.ncbi.nlm.nih.gov/17209889/
[462] https://pubmed.ncbi.nlm.nih.gov/19375095/?dopt=Abstract
[463] https://pubmed.ncbi.nlm.nih.gov/32194982/
[464] https://www.teachertoolkit.co.uk/wp-content/uploads/2022/10/s44159-022-00089-1.pdf
[465] https://www.nature.com/articles/s44159-022-00089-1
[421] https://journals.sagepub.com/doi/10.3102/00346543211019105
[422] https://eric.ed.gov/?id=EJ1308129
[423] https://x.com/rodjnaquin/status/1743661783611547763
[424] https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2022.956416/full
[425] https://www.research-collection.ethz.ch/handle/20.500.11850/492056
[426] https://phys.org/news/2021-09-productively-wiser.html
[427] https://ethz.ch/content/dam/ethz/special-interest/gess/ifv/professur-lehr-und-lernforschung/publikationen-stern/Schalk%20Schumacher%20Barth%20%20Stern%202017%20-When%20Problem-Solving%20Followed%20by%20Instruction%20Is.pdf
[428] https://boldscience.org/wp-content/uploads/2025/04/Productive-Failure.pdf
[429] https://german-uds.de/blog/productive-failure-how-ai-reshapes-critical-thinking----and-what-universities-must-do
[430] https://www.wright.edu/sites/www.wright.edu/files/uploads/2017/Mar/event/Loibl2016_TheoryProblemSolvingandInstruction.pdf
[431] https://learning-teaching-fair-2020.ethz.ch/project/780-2/
[432] https://www.visiblelearningmetax.com/influences/view/productive_failure_(errors)
[433] https://www.structural-learning.com/post/productive-failure-education-teachers-need
[434] https://www.tandfonline.com/doi/full/10.1080/10508406.2021.1964506
[435] https://link.springer.com/article/10.1007/s11251-020-09504-7
[466] https://journals.sagepub.com/doi/10.3102/0034654315582065
[467] https://eric.ed.gov/?id=EJ1008015
[468] https://research-portal.uu.nl/en/publications/a-meta-analysis-of-the-cognitive-and-motivational-effects-of-seri
[469] https://www.sri.com/wp-content/uploads/2021/12/digital-games-design-and-learning-executive_summary.pdf
[470] https://pmc.ncbi.nlm.nih.gov/articles/PMC4748544/
[471] https://www.sri.com/wp-content/uploads/2021/12/digital-games-design-and-learning-brief.pdf
[472] https://ocw.metu.edu.tr/mod/resource/view.php?id=5403&forceview=1
[473] https://www.clearinghouse.edu.tum.de/wp-content/uploads/2018/12/CHU_KR-2_Wouters1_2013_Spielbasiertes-Lernen.pdf
[474] https://www.studocu.com/pe/document/universidad-de-lima/fundamentos-de-la-comunicacion/5-a-meta-analysis-of-the-cognitive-and-motivational-effects-of-serious-games/109942261?origin=course-highest-rated-4
[475] https://www.semanticscholar.org/paper/A-meta-analysis-of-the-cognitive-and-motivational-Wouters-Nimwegen/68b75e47e1f6bd3fd42100f35475c9dbb5344be6
[476] https://www.youtube.com/watch?v=t-WkR8_SNpw
[477] https://www.scribd.com/document/667972532/Karl-Kapp-Trends-in-Gamification-2
[478] https://onlinelibrary.wiley.com/doi/10.1155/2019/4797032
[479] http://www.johnnietfeld.com/uploads/2/2/6/0/22606800/handbook_of_self-regulation_1pp_018.pdf
[480] https://scispace.com/papers/serious-games-as-new-educational-tools-how-effective-are-1r85nofm5l
[481] https://www.sciencedirect.com/science/article/abs/pii/S0260691719306495
[482] https://journals.sagepub.com/doi/10.1177/10468781241252521
[483] https://www.emerald.com/insight/content/doi/10.1108/itse-03-2013-0005/full/html
[484] https://onlinelibrary.wiley.com/doi/10.1111/medu.12432
[485] https://educationaltechnologyjournal.springeropen.com/articles/10.1186/s41239-017-0062-1
[486] https://www.tandfonline.com/doi/full/10.1080/13636820.2025.2462960
[487] https://pmc.ncbi.nlm.nih.gov/articles/PMC6187265/
[488] https://www.prisim.com/wp-content/uploads/2017/02/Value-of-Simulation-Training-Univ-of-CO.pdf
[489] https://pmc.ncbi.nlm.nih.gov/articles/PMC11294900/
[490] https://www.scribd.com/document/818542710/Simulation-Debriefing-Metaanalysis
[491] https://journals.sagepub.com/doi/full/10.3102/0034654320933544
[492] https://journals.sagepub.com/doi/10.1177/1046878118767729
[493] https://archive.johs.org.uk/downloads/article/pdf/contents-1679403421762-8ae22664-03ee-4bc3-821b-1cc46076beeb
[494] https://pmc.ncbi.nlm.nih.gov/articles/PMC9912432/
[495] https://onlinelibrary.wiley.com/doi/10.1155/2022/1578791
