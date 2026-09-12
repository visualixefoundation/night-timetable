import './globals.css';
import type { ReactNode } from 'react';
import { Fraunces, IBM_Plex_Sans } from 'next/font/google';

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
  title: 'Night Timetable',
  description: 'Weekly Form V / Form VI night teaching schedule',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexSans.variable}`}>
      <body className="min-h-screen bg-paper text-ink font-sans antialiased">
        <header className="bg-chalkboard text-paper border-b border-black/10">
          <nav className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
            <a
              href="/"
              className="font-display text-lg tracking-tight hover:opacity-90 transition-opacity"
            >
              Night Timetable
            </a>
            <div className="flex gap-6 text-sm text-paper/75">
              <a
                href="/dashboard"
                className="hover:text-paper transition-colors"
              >
                My schedule
              </a>
              <a href="/login" className="hover:text-paper transition-colors">
                Login
              </a>
            </div>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-5 py-8 sm:py-10">{children}</main>
      </body>
    </html>
  );
}
