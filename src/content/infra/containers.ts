import type { Landmark } from '../schema.ts';

export const landmark = {
  id: 'containers',
  title: 'Containers',
  draft: false,
  hook: 'Package the runtime; keep operations explicit.',
  definition: 'Containers package an application and its runtime files into a repeatable image. They give workers and services a consistent environment, but orchestration, storage, networking, and updates remain separate concerns.',
  when_to_use: [
    'You need a long-running service or queue worker.',
    'Runtime binaries and system dependencies must be explicit.',
    'Local, test, and production environments need the same packaged process.',
    'A managed host accepts container images but not your native runtime.'
  ],
  tradeoffs: {
    pros: [
      'Images make runtime dependencies explicit and reviewable.',
      'The same image can move through testing and deployment.',
      'Processes receive useful filesystem and dependency isolation.'
    ],
    cons: [
      'Image building, scanning, storage, and rollout add delivery work.',
      'Persistent data and secrets need external lifecycle rules.',
      'Scheduling, scaling, networking, and recovery still need an owner.'
    ]
  },
  example: 'A media service pulls uploads from a queue and runs FFmpeg for several minutes. Tell your agent to build a minimal Docker image, run as a non-root user, store outputs outside the container, and handle job retries idempotently.',
  gotchas: [
    'Keep credentials out of image layers and inject them at runtime.',
    'Require your agent to pin base images, scan dependencies, and define a rebuild cadence.',
    'Persist state outside the container and test termination during active work.'
  ],
  vibe_coder_default: 'Package long-running workers with Docker and deploy them on Fly.io when you need managed container hosting; stay with functions for bounded request work.',
  quiz: {
    question: 'Which workload most clearly benefits from a container?',
    options: ['A long-running FFmpeg queue worker', 'A static pricing page', 'A CSS hover effect'],
    answer: 'A long-running FFmpeg queue worker',
    explanation: 'A container makes the worker\'s binaries and long-lived runtime explicit and repeatable.'
  },
  sources: [
    { url: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/', checked: '2026-07-17' },
    { url: 'https://docs.docker.com/engine/storage/', checked: '2026-07-17' },
    { url: 'https://fly.io/docs/launch/deploy/', checked: '2026-07-17' }
  ]
} satisfies Landmark;
