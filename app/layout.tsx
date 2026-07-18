import type { Metadata } from 'next';
import { Pixelify_Sans } from 'next/font/google';

import { SessionProvider } from '@/lib/auth/SessionProvider';
import { SiteFooter } from '@/components/SiteFooter';
import './globals.css';

const pixelify = Pixelify_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-pixel' });

export const metadata: Metadata = {
  title: 'code-tutor — A Map for Post-AI Builders',
  description: 'code-tutor — A Map for Post-AI Builders'
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
