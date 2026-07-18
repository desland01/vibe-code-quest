import { LegalPage } from '@/components/legal/LegalPage';
import { refundContent } from '@/content/legal/refund';

export default function RefundPage() {
  return <LegalPage document={refundContent} />;
}
