export type RegionStatus = 'deep' | 'stub';
export type ContentFormat = 'overview' | 'lesson' | 'quiz';

export interface Landmark {
  id: string;
  title: string;
  hook: string;
  definition: string;
  whenToUse: string[];
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  example: string;
  gotchas: string[];
  vibeCoderDefault: string;
  quiz: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  };
}

export interface Region {
  id: string;
  title: string;
  label: string;
  status: RegionStatus;
  description: string;
  mapArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks: Landmark[];
}

const sqlLandmark: Landmark = {
  id: 'sql',
  title: 'SQL',
  hook: "The boring database choice that's almost always right.",
  definition:
    'SQL databases store rows in related tables. They are strong when your app needs durable records, joins, and predictable querying.',
  whenToUse: [
    'You know the shape of your data well enough to name the main tables.',
    'You need relationships between things like users, projects, invoices, and messages.',
    'You want the default path that most AI coding agents understand well.'
  ],
  tradeoffs: {
    pros: ['Mature and cheap to host', 'Agent-friendly query language', 'Great for transactional apps'],
    cons: ['Schema changes require migrations', 'Can feel heavy for a tiny one-table prototype']
  },
  example:
    'A client portal can start with users, companies, projects, and messages tables. The relationships are the product.',
  gotchas: ['Do not put database secrets in the browser.', 'Do not skip migrations once real users rely on the data.'],
  vibeCoderDefault: 'Postgres on Supabase or Neon. Add Drizzle when queries stop being tiny.',
  quiz: {
    question: 'Which app is the cleanest fit for SQL?',
    options: ['A single static landing page', 'A client portal with users, projects, invoices, and messages', 'A one-off image cropper'],
    answer: 'A client portal with users, projects, invoices, and messages',
    explanation: 'SQL shines when records relate to each other and need durable transactions.'
  }
};

const vectorLandmark: Landmark = {
  id: 'vector',
  title: 'Vector',
  hook: 'The AI memory shape for semantic search.',
  definition:
    'Vector storage turns content into embeddings so the app can find meaning-adjacent records instead of exact keyword matches.',
  whenToUse: [
    'You are building search over documents, transcripts, notes, or knowledge bases.',
    'The user asks fuzzy questions rather than exact filters.',
    'You need retrieval for an AI answer.'
  ],
  tradeoffs: {
    pros: ['Great for semantic recall', 'Pairs naturally with RAG apps', 'Can live inside Postgres via pgvector'],
    cons: ['Not a replacement for relational data', 'Quality depends on chunking and evals']
  },
  example:
    'A proposal assistant searches prior call notes and case studies by meaning, then drafts a relevant answer.',
  gotchas: ['Chunking matters more than the vendor at first.', 'Always show sources when vectors feed an AI answer.'],
  vibeCoderDefault: 'Start with pgvector in Postgres unless scale forces a dedicated vector database.',
  quiz: {
    question: 'When should a vibe coder reach for vectors?',
    options: ['When they need fuzzy search over documents', 'When they need a contact form', 'When they need CSS animations'],
    answer: 'When they need fuzzy search over documents',
    explanation: 'Vectors help with semantic retrieval, not generic app storage.'
  }
};

const serverlessLandmark: Landmark = {
  id: 'serverless',
  title: 'Serverless functions',
  hook: 'The default backend shape for many Vercel-era apps.',
  definition:
    'Serverless functions run backend code on demand. You write handlers, the platform handles servers, scaling, and most operations.',
  whenToUse: [
    'Your backend work is request-response shaped.',
    'You want to deploy fast without managing servers.',
    'Traffic is variable and you do not need always-on workers.'
  ],
  tradeoffs: {
    pros: ['Fast to ship', 'Low ops burden', 'Scales with traffic'],
    cons: ['Cold starts and time limits can matter', 'Background jobs and websockets may need another layer']
  },
  example:
    'A route handler receives a form submission, validates it, writes to the database, and returns a status.',
  gotchas: ['Do not run long video renders in a normal function.', 'Watch provider limits before launch day.'],
  vibeCoderDefault: 'Use Vercel Functions for normal app routes. Add queues only when the work outgrows requests.',
  quiz: {
    question: 'What is the best first use for serverless?',
    options: ['A 45-minute video render', 'A form submission handler', 'A permanent websocket room'],
    answer: 'A form submission handler',
    explanation: 'Serverless fits short request-response work.'
  }
};

const containersLandmark: Landmark = {
  id: 'containers',
  title: 'Containers',
  hook: 'The portability layer when the app needs more than simple functions.',
  definition:
    'Containers package your app and runtime into a repeatable unit. They help when you need long-running services, custom binaries, or background workers.',
  whenToUse: [
    'You need background work, queues, or persistent services.',
    'Your app depends on binaries or runtime details the platform does not provide.',
    'You want similar behavior locally and in production.'
  ],
  tradeoffs: {
    pros: ['Portable runtime', 'Good for workers', 'Matches many production environments'],
    cons: ['More ops surface', 'More deployment choices to understand']
  },
  example:
    'A media app uses a container worker with ffmpeg to process uploads outside the request path.',
  gotchas: ['Containers are not magic scaling.', 'Keep secrets and volumes explicit.'],
  vibeCoderDefault: 'Do not start here. Reach for Fly.io, Railway, or Render when serverless stops fitting.',
  quiz: {
    question: 'What signal says containers may be needed?',
    options: ['You need a static home page', 'You need long-running background video processing', 'You need a button hover state'],
    answer: 'You need long-running background video processing',
    explanation: 'Long-running workers are a common reason to leave pure serverless.'
  }
};

export const regions: Region[] = [
  {
    id: 'languages',
    title: 'Languages',
    label: 'Syntax is the road sign, not the road.',
    status: 'stub',
    description: 'JavaScript, TypeScript, Python, SQL, and why agents made syntax less central but not irrelevant.',
    mapArea: { x: 8, y: 12, width: 20, height: 28 },
    landmarks: []
  },
  {
    id: 'databases',
    title: 'Databases',
    label: 'Where app memory becomes product memory.',
    status: 'deep',
    description: 'SQL, NoSQL, vector, graph, ORMs, and hosted-vs-self-hosted defaults.',
    mapArea: { x: 33, y: 10, width: 26, height: 34 },
    landmarks: [sqlLandmark, vectorLandmark]
  },
  {
    id: 'infra',
    title: 'Infra / Hosting',
    label: 'The deployment terrain under every working app.',
    status: 'deep',
    description: 'Serverless, VPS, containers, edge, static CDN, and managed platforms.',
    mapArea: { x: 64, y: 16, width: 27, height: 30 },
    landmarks: [serverlessLandmark, containersLandmark]
  },
  {
    id: 'ai-types',
    title: 'AI Types',
    label: 'Chat, agents, RAG, tools, evals, and model routing.',
    status: 'stub',
    description: 'The difference between a model call, an agent, a workflow, and a product feature.',
    mapArea: { x: 11, y: 50, width: 26, height: 30 },
    landmarks: []
  },
  {
    id: 'pm-tools',
    title: 'PM Tools',
    label: 'Linear, issues, specs, and the work graph agents read.',
    status: 'stub',
    description: 'Project management as machine-readable product memory, not just human planning.',
    mapArea: { x: 42, y: 52, width: 19, height: 25 },
    landmarks: []
  },
  {
    id: 'git',
    title: 'Git',
    label: 'The time machine every serious builder eventually needs.',
    status: 'stub',
    description: 'Branches, commits, PRs, reviews, and why agents need clean version control.',
    mapArea: { x: 66, y: 55, width: 21, height: 20 },
    landmarks: []
  },
  {
    id: 'security',
    title: 'Security',
    label: 'Secrets, permissions, trust boundaries, and blast radius.',
    status: 'stub',
    description: 'The minimum safety map for apps built with fast-moving AI assistance.',
    mapArea: { x: 20, y: 82, width: 26, height: 13 },
    landmarks: []
  },
  {
    id: 'design',
    title: 'Design Systems',
    label: 'The layer between a working app and a believable app.',
    status: 'stub',
    description: 'Tokens, components, patterns, accessibility, and professional visual consistency.',
    mapArea: { x: 53, y: 82, width: 28, height: 13 },
    landmarks: []
  }
];

export const defaultRegion = regions.find((region) => region.id === 'databases') ?? regions[0];
