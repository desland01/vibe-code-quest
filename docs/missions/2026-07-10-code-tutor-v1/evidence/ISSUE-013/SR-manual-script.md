# ISSUE-013 manual screen-reader walkthrough

Tested interaction model: macOS VoiceOver with Safari. These are expected announcements from the implemented names and landmarks; exact punctuation and shortcut-help suffixes vary by VoiceOver settings.

1. Open `/` and start VoiceOver (`Command-F5`). Press `Control-Option-Right Arrow` from the page start. Expect “Skip to regions, link.” Activate it with `Control-Option-Space`; focus moves to “Languages, toggle button” (VoiceOver may also say “not pressed”).
2. Navigate backward to the “Learning regions” heading and its linearized list. Each of its eight links is announced as “<region>, 6 landmarks, link,” providing a nonvisual alternative to the rendered islands.
3. Return to the region buttons and move through all eight. Expect, in order: Languages, Git / Version Control, Databases, AI Types / Models, Security, Infra / Hosting, Design / UX, and PM / Tools. Each control is a button and reports its pressed state.
4. On “Databases,” press `Control-Option-Space`. Expect the polite status “Databases selected — panel open,” followed by focus on the complementary region panel headed “Databases.” The panel exposes six landmark links and “Explore Databases.”
5. Press Escape. The panel closes and focus returns to the Databases region button. No extra close announcement is injected; the focus move and the button’s unpressed state communicate the change.
6. Move focus to “Interactive learning map” and press `+`. Expect the polite announcement “Zoom 2x.” Press `-` and expect “Zoom 1x.” Arrow keys pan without repetitive announcements.
7. Open Databases again, move to “Explore Databases,” and activate it. On `/map/databases`, expect a main landmark, a “Skip to landmarks” link, “Back to map,” the “Databases” level-one heading, and a “Databases landmarks” region containing six landmark links.
8. Activate “SQL.” On `/map/databases/sql`, expect the SQL card to report “current page,” followed by the landmark detail headed “SQL.” The Lesson format group contains Overview, Lesson, and Quiz toggle buttons; Overview is pressed by default.
9. Activate “Quiz.” Expect Quiz to become pressed and the format note and Quiz section to appear. Use the browser Back command; Next.js restores the prior route while normal browser/VoiceOver focus rules apply. The page’s “Skip to landmarks” link and focusable `main-content`/`landmark-list` targets provide deterministic re-entry points; no custom focus hijacking occurs on history navigation.
10. Activate “Back to map.” Expect `/map` with the top-map main landmark and the eight region buttons. Next.js performs the route transition and scroll handling; use “Skip to regions” to return directly to the first region control.

Also repeat steps 1–6 with Reduce Motion enabled. The semantics and announcements are unchanged; sea shimmer, island lift, and sub-map zoom-in motion are disabled.
