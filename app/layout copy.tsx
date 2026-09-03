import type { Metadata } from 'next';
import { Cairo, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-body' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-mono-family' });

export const metadata: Metadata = {
  title: 'أبو سلطان | متجر الباقات الرقمية',
  description: 'متجر أبو سلطان للباقات الرقمية والحسابات والأكواد مع تسليم فوري وآمن.',
  openGraph: { title: 'أبو سلطان | متجر الباقات الرقمية', description: 'باقات رقمية موثوقة بتسليم فوري.', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl" className="bg-background"><body className={`${cairo.variable} ${plexMono.variable} font-sans min-h-screen antialiased`} suppressHydrationWarning>{children}</body></html>;
}
