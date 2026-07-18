import Link from 'next/link';

export const legalLinks = [
  { href: '/legal/terms', label: 'Terms of Service' },
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/refund', label: 'Cancellation & Refund Policy' }
] as const;

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: '2px solid var(--banner-border)',
        background: 'var(--banner)',
        padding: '20px clamp(16px, 3vw, 40px)',
        color: 'var(--ink)'
      }}
    >
      <nav
        aria-label="Legal"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px 24px'
        }}
      >
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href} style={{ color: 'inherit', fontWeight: 700 }}>
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
