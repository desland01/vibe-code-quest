import { regions } from '@/lib/content';
import { UpgradeAccountModal } from '@/components/UpgradeAccountModal';

export function MapExperience() {
  return (
    <main>
      <h1>code-tutor</h1>
      <UpgradeAccountModal />
      <ul aria-label="Learning regions">
        {regions.map((region) => (
          <li key={region.id}>{region.title}</li>
        ))}
      </ul>
    </main>
  );
}
