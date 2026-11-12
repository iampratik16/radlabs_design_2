import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Cormorant_Garamond, Hanken_Grotesk, Mr_Dafoe } from 'next/font/google';
import Nav from '@/components/Nav';
import ScrollReveal from '@/components/ScrollReveal';
import SiteFooter from '@/components/SiteFooter';
import './globals.css';

/**
 * Both faces are variable, so no `weight` is given — next/font pulls the full
 * axis range and self-hosts it. That removes the render-blocking round trip to
 * fonts.googleapis.com the static build had, and kills the flash of fallback
 * on a Didone, where the swap is very visible.
 */
const display = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

/**
 * The third face, and the only one given explicit weights: Cormorant Garamond
 * is served as statics, not a variable axis. 300 is the point of it — Bodoni
 * Moda's axis starts at 400, and the reference treatment is a hairline.
 */
const fine = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300'],
  style: ['normal', 'italic'],
  variable: '--font-fine',
  display: 'swap',
});

/** The wordmark, and nothing else. One weight, because a signature has one. */
const signature = Mr_Dafoe({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-sig',
  display: 'swap',
});

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'RadLabs Design — Brand, web and growth for luxury',
    template: '%s · RadLabs Design',
  },
  description:
    'RadLabs Design is the studio behind luxury websites, brand identities, AI-powered growth marketing and high-end merchandise for brands that sell on desire, not discount.',
  openGraph: {
    type: 'website',
    siteName: 'RadLabs Design',
    title: 'RadLabs Design — Brand, web and growth for luxury',
    description:
      'The design and growth studio for brands that sell on desire, not discount.',
    images: [{ url: '/img/hero-poster.jpg', width: 1920, height: 1080 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RadLabs Design',
    description:
      'The design and growth studio for brands that sell on desire, not discount.',
    images: ['/img/hero-poster.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#14100E',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${fine.variable} ${signature.variable} ${sans.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <SiteFooter />
        <ScrollReveal />
      </body>
    </html>
  );
}
