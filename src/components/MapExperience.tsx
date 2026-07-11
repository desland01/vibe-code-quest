import { regions } from '@/data/regions';

export function MapExperience() {
  return (
    <main>
      <h1>code-tutor</h1>
      <ul aria-label="Learning regions">
        {regions.map((region) => (
          <li key={region.id}>{region.title}</li>
        ))}
      </ul>
    </main>
  );
}
