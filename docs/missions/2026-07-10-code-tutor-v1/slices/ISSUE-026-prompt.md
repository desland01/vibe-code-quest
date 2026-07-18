You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor. Make no commits. No npm install. Build fails on fonts in your sandbox — run typecheck/lint/test only; orchestrator runs build + e2e.

# ISSUE-026 — Legal pages (REQ-018; VAL-043) — AGENT-DRAFTED, content review is HITL-LEGAL

Bound: app/legal/terms/page.tsx, app/legal/privacy/page.tsx, app/legal/refund/page.tsx (new), a shared src/components/legal/LegalPage.tsx (new, simple readable layout using existing CSS tokens), a footer component src/components/SiteFooter.tsx (new) wired into app/layout.tsx OR MapExperience so the three legal links appear site-wide, e2e/legal.spec.ts (new), src/content/legal/*.ts (new — the page copy as structured data). Do NOT touch billing/AI/map logic.

Context (zero chat context assumed):
- Product: code-tutor, "A Map for Post-AI Builders" — an interactive learning map for people building apps by directing AI agents. Business model: 14-day no-card free trial, then a $-priced monthly subscription (placeholder $9/mo, Stripe TEST mode). Stores: an optional email (for account upgrade via OTP), learning progress, usage/cost telemetry. Content includes AI-generated explanations.
- These pages are AGENT-DRAFTED and MUST carry a visible "Draft — pending legal review" notice at the top of each page AND every page must be marked so the user knows a lawyer has not reviewed them. The actual legal sufficiency review is HITL (user, at closeout) — you are producing a solid, honest starting draft, not final legal advice.
- Placeholder brand name: use "code-tutor" and a placeholder company/contact ("code-tutor" / "support@code-tutor.example") — do NOT invent a real legal entity, address, or jurisdiction; use clearly-marked placeholders like "[COMPANY LEGAL NAME]", "[JURISDICTION]", "[CONTACT EMAIL]" so the user fills them at review.

Tasks:
1. Three legal pages (server components) rendered via a shared LegalPage layout: readable prose, headings, last-updated placeholder, and a prominent "⚠ Draft — pending legal review; placeholders in [BRACKETS] must be completed before launch" banner at the top of each.
   - Terms of Service: service description, eligibility, accounts (anonymous + email upgrade), acceptable use, subscription + 14-day no-card trial terms, disclaimer that content (incl. AI-generated explanations) is educational and may be inaccurate — not professional advice, limitation of liability, changes to terms, contact. Bracketed placeholders for entity/jurisdiction.
   - Privacy Policy: what's collected (email if provided, progress, usage telemetry, minimal analytics events — reference the 13-event taxonomy at a high level), how it's used, third parties (Neon database, Vercel hosting, Stripe payments in test mode, the AI Gateway/model providers), data retention, user rights (access/delete — direct to [CONTACT EMAIL]), cookies (session cookie for anonymous identity), children, changes, contact. Honest and specific to THIS app's actual data flows.
   - Cancellation & Refund Policy: how to cancel (self-serve before trial end = no charge; after subscribing, cancel any time, access through period end), refund stance for a monthly digital subscription, trial clarity (no card required, no auto-charge without explicit subscribe), contact for billing issues.
2. Put the copy in src/content/legal/*.ts as structured sections (title, lastUpdated placeholder, sections[]) and render from there (keeps pages thin + testable).
3. SiteFooter with links to /legal/terms, /legal/privacy, /legal/refund, rendered site-wide (top map + sub-map + legal pages). The checkout link requirement (VAL-043 "linked from checkout") — since billing UI lands in ISSUE-027, expose the three links from a shared component ISSUE-027 can also drop into the paywall; the footer satisfies the site-wide requirement now.
4. e2e/legal.spec.ts (VAL-043): all three routes render with their H1 + the draft banner; footer links are present and navigate to each; keep all existing e2e green.

Validation: VAL-043 (routes render + linked from footer; content review stays HITL). VAL-001/003 gate. VAL-002 no secrets.

Stop conditions: a command fails twice → STOP.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.
