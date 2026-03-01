import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Keystone Supply PMS',
  description: 'Realtime project management • Zero file movement',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}