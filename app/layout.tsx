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
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}