import { AudioPreview } from '@/components/AudioPreview';

export const metadata = {
  title: 'Audio preview — Vibe Code Quest',
  robots: { index: false, follow: false },
};

/**
 * ISSUE-018 / ISSUE-021 evidence surface.
 *
 * The owner has to CHOOSE the default music variant by ear (VAL-029), and that
 * decision cannot be made from a spec table or a waveform screenshot. This page
 * exists so all three variants are playable side by side, in the same session,
 * with the same synth — which is the only way the comparison is about the
 * arrangements rather than about the rendering.
 *
 * It is `noindex` and linked from nowhere: it is a review tool, not a product
 * surface. Choosing the default is an OWNER decision and is not made here.
 */
export default function AudioPreviewPage() {
  return <AudioPreview />;
}
