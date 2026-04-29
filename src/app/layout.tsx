import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'], variable: '--font-dm-sans',
  weight: ['300', '400', '500'], display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'], variable: '--font-dm-serif',
  weight: ['400'], display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cosmic Calendar',
  description: 'A minimalist circular calendar for seasonal and cosmic rhythms. A side project by Osvaldo Uribe.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="antialiased text-stone-800" style={{ background: '#F7F5F0' }}>
        {children}
      </body>
    </html>
  );
}