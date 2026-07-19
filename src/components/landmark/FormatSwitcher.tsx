'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { KeyboardEvent } from 'react';
import { recordClientEvent } from './clientEvents';
import { LANDMARK_FORMATS, type LandmarkFormat } from './formats';

export type { LandmarkFormat } from './formats';
export const landmarkFormats = LANDMARK_FORMATS;
const labels: Record<LandmarkFormat, string> = { overview: 'Overview', lesson: 'Lesson', quiz: 'Quiz' };

export function FormatSwitcher({ format, regionId, landmarkId }: { format: LandmarkFormat; regionId: string; landmarkId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const choose = (next: LandmarkFormat) => {
    router.replace(`${pathname}?format=${next}`, { scroll: false });
    recordClientEvent('format_switched', { region: regionId, landmark: landmarkId, format: next });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? landmarkFormats.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + landmarkFormats.length) % landmarkFormats.length;
    const next = landmarkFormats[nextIndex];
    choose(next);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[nextIndex]?.focus();
  };
  return (
    <div className="format-switcher" role="group" aria-label="Landmark format">
      {landmarkFormats.map((value, index) => (
        <button key={value} type="button" className={format === value ? 'is-active' : ''} aria-current={format === value ? 'true' : undefined} onClick={() => choose(value)} onKeyDown={(event) => onKeyDown(event, index)}>
          {labels[value]}
        </button>
      ))}
    </div>
  );
}
