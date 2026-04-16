import { Barlow_Condensed, Source_Sans_3, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-source',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Panel Sizing Quote — DT Solutions',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${barlow.variable} ${sourceSans.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
