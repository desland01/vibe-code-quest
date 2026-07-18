import { LegalPage } from '@/components/legal/LegalPage';
import { privacyContent } from '@/content/legal/privacy';

export default function PrivacyPage() {
  return <LegalPage document={privacyContent} />;
}
