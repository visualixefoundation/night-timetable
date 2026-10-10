import './globals.css';
import type { ReactNode } from 'react';
import { Fraunces, IBM_Plex_Sans } from 'next/font/google';
import SiteHeader from './components/SiteHeader';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-display',
});

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

export const metadata = {
  title: 'Night Timetable · St. Joseph Boys Science High School',
  description:
    'Weekly Form V / Form VI night teaching schedule for St. Joseph Boys Science High School',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexSans.variable}`}>
      <body className="min-h-screen bg-paper text-ink font-sans antialiased flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-start justify-center px-5 py-8 sm:py-10">
          <div className="w-full max-w-6xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
