import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cosmic Calendar',
  description: 'A minimalist circular calendar for seasonal and cosmic rhythms. A side project by Osvaldo Uribe.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased" style={{ background: '#F7F5F0', fontFamily: 'var(--font-inter)' }}>
        {children}
      </body>
    </html>
  );
}
