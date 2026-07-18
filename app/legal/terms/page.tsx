import { LegalPage } from '@/components/legal/LegalPage';
import { termsContent } from '@/content/legal/terms';

export default function TermsPage() {
  return <LegalPage document={termsContent} />;
}
