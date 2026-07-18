# VAL-052 launch assets held — ISSUE-031 (2026-07-19)

## Assets present (docs/launch/)
- `demo.gif` — full-flow demo (map → onboarding → region → sub-map → landmark overview → quiz), 800px, ~283KB.
- `screenshots/home-desktop.png` (1440×900), `screenshots/home-mobile.png` (390×844), `screenshots/landmark-quiz.png` (full-page).
- `show-hn.md` — Show HN title + body (honest voice, no metrics, [PRODUCTION URL] placeholder).
- `tweet-thread.md` — 5-7 tweet launch thread with attach notes.
- `README.md` — asset index + HELD status.
- `POST-CHECKLIST.md` — pre-post gate (swap URL, HITL-LEGAL, price/name, Stripe live-mode, no-auto-post confirmation).

## Absence-of-posting assertion (D3 — nothing posted)
- No social/HN posting integration, scheduler, webhook, or `curl -X POST` to any social/news endpoint exists in docs/launch/ or scripts/ (grep: 0 matches).
- All external URLs in the copy are bracketed placeholders / preview URLs; no live publish path.
- Copy explicitly states HELD status; POST-CHECKLIST requires explicit human approval before any post.
- Gate green (typecheck/lint/test/build). Verified at ISSUE-032 closeout that nothing was posted.
