# ISSUE-023 evidence — ten Git beats for owner voice review (VAL-053)

Generated from the SHIPPED registry, not retyped. Regenerate after any content change.

Ten beats across all three tiers of the Git island. HANDOFF §9 notes that
VAL-053's table still says the sample spans islands — it cannot, before fan-out.
The execution plan and ISSUE-023 both say Git across three levels, which is this.

The owner decision is: does this sound like one person, and is that person
deadpan without being smug or mean? Approve or reject. Nothing here is a
proposal — it is what currently ships.

---

## 1. `git/commits-as-checkpoints/l1` — beat `hook` (hook)

**Prompt.** A commit is a save point. Git is the save system.


## 2. `git/working-tree-hygiene/l1` — beat `reveal-definition` (reveal)

**Prompt.** Working-tree hygiene

- card: A repo is your project folder plus its history.
- card: Repository is the long name, and Git keeps that history.
- card: Every file in it is saved, changed, or brand new.

## 3. `git/branches-as-isolation/l1` — beat `gotcha-trap` (gotcha)

**Prompt.** One of these bites you later. Find it.


- (**correct**) Check which branch you are on before working.
  - feedback: Yep.
- (wrong) You can try an idea and throw it away.
  - feedback: Not that one. That's a benefit: You can try an idea and throw it away.
- (wrong) The main branch keeps working the whole time.
  - feedback: Not that one. That's a benefit: The main branch keeps working the whole time.
- (wrong) Two ideas can exist at the same time.
  - feedback: Not that one. That's a benefit: Two ideas can exist at the same time.

_Hint._ Two of these are fine. One is not.

## 4. `git/revert-and-recovery/l1` — beat `recap` (recap)

**Prompt.** Undo exists in Git. You have to ask for it.

- bullet: A revert is a new commit undoing an older one.
- bullet: Revert to undo. Never reset without reading first.
- bullet: Revert and reset are not the same thing.
- bullet: The bad change goes away and stays visible.

## 5. `git/merge-conflicts/l2` — beat `scenario-default` (scenario)

**Prompt.** You and I both changed the price field. I am picking my version. OK?


- (**correct**) Ask what each side does before you choose.
  - feedback: Yep.
- (wrong) A resolved conflict can still lose behavior.
  - feedback: Not that one. That's the risk: A resolved conflict can still lose behavior.
- (wrong) Both sides can be wrong at the same time.
  - feedback: Not that one. That's the risk: Both sides can be wrong at the same time.
- (wrong) Explaining the intent takes longer than merging.
  - feedback: Not that one. That's the cost: Explaining the intent takes longer than merging.

_Hint._ Pick the safest default here.

## 6. `git/pull-requests-and-review/l2` — beat `scenario-default` (scenario)

**Prompt.** Tests pass. I am going to merge this straight into main and skip the pull request. OK?


- (wrong) Main is what your users actually get.
  - feedback: Not that one. That's the risk: Main is what your users actually get.
- (wrong) Merging is much harder to undo than pushing.
  - feedback: Not that one. That's the risk: Merging is much harder to undo than pushing.
- (wrong) Waiting for review slows a fast build.
  - feedback: Not that one. That's the cost: Waiting for review slows a fast build.
- (**correct**) Push it, but open the pull request first.
  - feedback: Yep.

_Hint._ Pick the safest default here.

## 7. `git/working-tree-hygiene/l2` — beat `default-commit` (default)

**Prompt.** Make it list the files before it discards.


## 8. `git/branches-as-isolation/l3` — beat `hook` (hook)

**Prompt.** Two agents, one folder, zero survivors. Give each its own lane.


## 9. `git/commits-as-checkpoints/l3` — beat `gotcha-trap` (gotcha)

**Prompt.** One of these rides along into the commit. Find it.


- (wrong) A staged diff you already read
  - feedback: Not that one. A reviewed diff is what belongs in a snapshot.
- (**correct**) The env file holding your keys
  - feedback: Yep. Keep secrets and local env files out of snapshots.
- (wrong) Test files for the change
  - feedback: Not that one. Tests belong with the change they cover.

_Hint._ Two of these are fine. One is not.

## 10. `git/revert-and-recovery/l3` — beat `recap` (recap)

**Prompt.** Back out agent mistakes without erasing the trail.

- bullet: Git has one recovery tool per state.
- bullet: Revert the bad shared commit. Reset only after review.
- bullet: Check status and save uncommitted work first.
- bullet: Reverts keep shared history whole and auditable.

---

Owner sign-off (VAL-053): APPROVED / REJECTED — ____________  date ____________

