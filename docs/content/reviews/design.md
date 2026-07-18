# Design Systems content review

Checked: 2026-07-17  
Checker: codex worker; orchestrator URL verification pending

## Design tokens

Claim → source → checked → checker:

- Design tokens represent reusable design decisions → https://m3.material.io/foundations/design-tokens/overview → 2026-07-17 → codex worker; orchestrator URL verification pending
- Tailwind theme variables define utility classes and design tokens → https://tailwindcss.com/docs/theme → 2026-07-17 → codex worker; orchestrator URL verification pending
- Spectrum organizes design tokens as named design decisions → https://spectrum.adobe.com/page/design-tokens/ → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. The default favors semantic tokens over one-off values. The example directs an agent to propose missing roles before adding raw values.

Deviations: None.

## Component libraries

Claim → source → checked → checker:

- shadcn/ui distributes component code for teams to own and customize → https://ui.shadcn.com/docs → 2026-07-17 → codex worker; orchestrator URL verification pending
- Radix Primitives provide accessible, customizable interface primitives → https://www.radix-ui.com/primitives/docs/overview/introduction → 2026-07-17 → codex worker; orchestrator URL verification pending
- Tailwind composes styles with utility classes → https://tailwindcss.com/docs/styling-with-utility-classes → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. The advice treats the library as a maintained vocabulary, not a visual shortcut. Costs cover upgrades, customization, and fit.

Deviations: None.

## Layout and spacing rhythm

Claim → source → checked → checker:

- Tailwind provides a shared spacing scale for padding utilities → https://tailwindcss.com/docs/padding → 2026-07-17 → codex worker; orchestrator URL verification pending
- Tailwind supports mobile-first responsive utility variants → https://tailwindcss.com/docs/responsive-design → 2026-07-17 → codex worker; orchestrator URL verification pending
- Material Design documents responsive layout principles → https://m3.material.io/foundations/adaptive-design/overview → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. Guidance explains how to replace locally plausible margins with shared containers, spacing tokens, and content-driven responsive rules.

Deviations: None.

## Typography and hierarchy

Claim → source → checked → checker:

- W3C guidance uses headings to communicate page organization → https://www.w3.org/WAI/tutorials/page-structure/headings/ → 2026-07-17 → codex worker; orchestrator URL verification pending
- MDN documents semantic HTML as a foundation for accessible structure → https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML → 2026-07-17 → codex worker; orchestrator URL verification pending
- Material Design defines a systematic typography approach → https://m3.material.io/styles/typography/overview → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. The landmark separates semantic structure from visual type roles and gives a restrained system scale as the default.

Deviations: None.

## Accessibility floor

Claim → source → checked → checker:

- WCAG 2 provides testable accessibility requirements at conformance levels including AA → https://www.w3.org/WAI/standards-guidelines/wcag/ → 2026-07-17 → codex worker; orchestrator URL verification pending
- The ARIA Authoring Practices Guide documents accessible widget patterns and keyboard behavior → https://www.w3.org/WAI/ARIA/apg/ → 2026-07-17 → codex worker; orchestrator URL verification pending
- MDN documents web accessibility practices and semantic foundations → https://developer.mozilla.org/en-US/docs/Web/Accessibility → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. Accessibility is part of the agent's definition of done. The guidance sets WCAG 2.2 AA as a floor and still requires manual workflow checks.

Deviations: None.

## Consistency vs novelty

Claim → source → checked → checker:

- WCAG calls for repeated navigation to appear in a consistent relative order → https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html → 2026-07-17 → codex worker; orchestrator URL verification pending
- WCAG calls for components with the same function to be identified consistently → https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html → 2026-07-17 → codex worker; orchestrator URL verification pending
- Material Design documents interaction foundations for interface behavior → https://m3.material.io/foundations/interaction/states/overview → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. The default keeps routine interactions conventional and reserves novelty for tested product-defining moments.

Deviations: None.

## Region-wide voice self-check

- Regional thesis, the layer between a working app and a believable app: PASS.
- Direct, warm, second-person voice: PASS.
- Agent direction and human ownership are explicit: PASS.
- Hooks are sharp; definitions use plain language: PASS.
- Three or four concrete use cases per landmark: PASS.
- At least three pros and two honest costs per landmark: PASS.
- Real app scenarios with actionable agent instructions: PASS.
- Imperative, agent-aware gotchas: PASS.
- Decisive defaults with documented product anchors: PASS.
- No marketing fluff, “simply,” “just,” interview framing, or agent mysticism: PASS.

## Orchestrator verification

**COMPLETE — 2026-07-18, mission orchestrator (Claude Opus 4.8).** All source URLs HTTP-verified: 16/18 200 first pass; 2 dead Material 3 links (layout/understanding-layout, interaction/overview — both 404) replaced with live M3 pages (adaptive-design/overview, interaction/states/overview) and manifest regenerated; full re-scan shows 0 non-200. Reviewed hooks/defaults across all 6: design framed as the believable-app layer; defaults concrete (tokens over one-off values, maintained component library [shadcn/ui, Radix + Tailwind], system type scale, WCAG AA floor as agent's definition of done, novelty spent deliberately). VOICE-conformant. VAL-030: no drafts remain. APPROVED.
