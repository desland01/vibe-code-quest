import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vibe Tutor',
  description: 'A post-AI builder map for learning the development landscape strategically.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
