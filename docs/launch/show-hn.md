# Show HN draft

## Title

Show HN: code-tutor — A Map for Post-AI Builders

## Body

Hi HN — I built code-tutor for people who can ship an app by directing coding agents, then get stuck when the agent asks a question like “Which database?”, “How should auth work?”, or “Where does this run?”

It’s an interactive, cozy 16-bit-RPG-style map of the decisions an AI-era builder actually encounters. There are eight regions—languages, databases, infrastructure/hosting, AI types, PM tools, Git, security, and design systems—with six landmarks each.

Every landmark has a plain-language definition, when to use it, honest tradeoffs, a real example, agent-specific gotchas, an opinionated “vibe-coder default,” and a deterministic quiz. You can use a quick overview, a fuller lesson, or ask an AI guide questions in context.

The difference I’m aiming for is decision literacy, not syntax coverage. This is not a bootcamp or big-tech interview prep. It is an opinionated concept map, so some defaults will be debatable. It also won’t replace building, debugging, or reading primary documentation. The AI guide can still be wrong; the authored lessons and quizzes are the stable core.

You can start anonymously. Email is optional for saving progress. There’s a 14-day, no-card free trial, followed by a low monthly price.

How it’s built: Next.js, Neon Postgres with RLS, Vercel AI Gateway, and a Pixi.js map.

I’d especially value feedback on missing concepts, questionable defaults, and whether the map helps you make a real project decision: [PRODUCTION URL]
