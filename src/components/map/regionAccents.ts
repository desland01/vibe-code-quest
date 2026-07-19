export const REGION_ACCENTS: Record<string, string> = {
  databases: '#d98f6c',
  infra: '#8f9fd9',
  'ai-types': '#c98fd9',
  git: '#d96c6c',
  languages: '#6cd9a8',
  security: '#d9c96c',
  design: '#ed9ec4',
  'pm-tools': '#9ad0ed'
};

export const REGION_ACCENT_FALLBACK = '#d98f6c';

export function getRegionAccent(regionId: string): string {
  return REGION_ACCENTS[regionId] ?? REGION_ACCENT_FALLBACK;
}

export function getRegionAccentPixi(regionId: string): number {
  const hex = getRegionAccent(regionId);
  return parseInt(hex.slice(1), 16);
}
