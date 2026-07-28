import type { Metadata } from 'next';
import { Pixelify_Sans } from 'next/font/google';

import { SessionProvider } from '@/lib/auth/SessionProvider';
import { SiteFooter } from '@/components/SiteFooter';
import './globals.css';

const pixelify = Pixelify_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-pixel' });

export const metadata: Metadata = {
  title: 'Vibe Code Quest by Truline — A Map for Post-AI Builders',
  description: 'A free learning map for people building software with AI agents. 48 landmarks across 8 regions.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={pixelify.variable}>
        <SessionProvider>
          {children}
          <SiteFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
