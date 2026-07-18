import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'vps-single-server',
  title: 'VPS / single server',
  draft: false,
  hook: 'One understandable machine, with all the chores included.',
  definition: 'A virtual private server gives you an always-on machine with its own operating system and resources. It offers direct control, while making you responsible for security updates, backups, monitoring, and recovery.',
  when_to_use: [
    'You need an always-on process with predictable, modest traffic.',
    'Your application requires system packages or network controls a managed runtime lacks.',
    'You can own patching, backups, monitoring, and incident response.',
    'A single failure domain is acceptable or you have planned failover.'
  ],
  tradeoffs: {
    pros: [
      'You control the operating system, runtime, ports, and background processes.',
      'One machine keeps the initial architecture easy to inspect.',
      'Fixed resources can make steady workloads easier to budget.'
    ],
    cons: [
      'You own security patches, firewall rules, backups, and restore drills.',
      'The server is a failure domain unless you add redundancy.',
      'Scaling and zero-downtime deploys require additional design.'
    ]
  },
  example: 'An internal inventory service runs an API, a scheduled importer, and a small PostgreSQL instance for twelve staff members. Tell your agent to create repeatable deploys, restrict inbound ports, back up off-server, and document a tested restore path.',
  gotchas: [
    'Disable password-based administrative access and restrict exposed ports before launch.',
    'Require your agent to preserve persistent data across deploys and prove backups restore elsewhere.',
    'Monitor disk, memory, certificates, and failed services before users become the alert system.'
  ],
  vibe_coder_default: 'Choose a DigitalOcean Droplet for a modest always-on service only when you accept server operations; use a managed platform when you do not.',
  quiz: {
    question: 'What must you accept before choosing one VPS?',
    options: ['Ownership of patching, backups, and recovery', 'Automatic multi-region failover', 'No need for monitoring'],
    answer: 'Ownership of patching, backups, and recovery',
    explanation: 'A VPS gives you machine control by transferring core operating responsibilities to you.'
  },
  sources: [
    { url: 'https://docs.digitalocean.com/products/droplets/', checked: '2026-07-17' },
    { url: 'https://docs.digitalocean.com/products/droplets/how-to/connect-with-ssh/', checked: '2026-07-17' },
    { url: 'https://docs.hetzner.com/cloud/servers/overview/', checked: '2026-07-17' }
  ]
} satisfies Landmark;
