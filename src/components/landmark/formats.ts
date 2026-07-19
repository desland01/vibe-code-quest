export const LANDMARK_FORMATS = ['overview', 'lesson', 'quiz'] as const;
export type LandmarkFormat = (typeof LANDMARK_FORMATS)[number];

export function isLandmarkFormat(value: string): value is LandmarkFormat {
  return LANDMARK_FORMATS.includes(value as LandmarkFormat);
}
