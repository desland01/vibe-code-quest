import type { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
}
