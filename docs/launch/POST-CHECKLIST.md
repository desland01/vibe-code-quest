# Launch pre-post checklist

Run this checklist manually immediately before posting anything.

- [ ] Replace every `[PRODUCTION URL]` placeholder and any preview URL with the final production URL.
- [ ] Open the final URL in a signed-out browser and verify the landing page, anonymous start, map, landmark, quiz, and optional email-save path.
- [ ] Confirm **HITL-LEGAL is done** and the approved legal pages are live.
- [ ] Confirm the product name and launch title are final.
- [ ] Confirm the monthly price is final; replace “low monthly price” with the approved amount if appropriate.
- [ ] Confirm the Stripe live-mode decision, including whether billing is enabled and whether all displayed trial and price claims match the configured product.
- [ ] Confirm the 14-day trial requires no card in the live launch flow.
- [ ] Re-capture `demo.gif` against the final Pixi canvas render if desired; check that no preview URL, test data, private account detail, or visual glitch appears.
- [ ] Review every screenshot and the GIF at full size and on mobile.
- [ ] Recheck that every tweet is under 280 characters after replacing the URL.
- [ ] Read the Show HN post and thread once as plain text; remove any claim that is not true in production.
- [ ] Confirm **nothing auto-posts**: no scheduler, webhook, CI job, social integration, or launch script is configured to publish these drafts.
- [ ] Post only after explicit human approval of price, name, legal, live-mode, final URL, copy, and media.
