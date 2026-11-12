/**
 * Site content as typed data.
 *
 * Everything that repeats on the page lives here rather than in markup, so a
 * new service or case study is one object, not a block of copy-pasted JSX
 * that can drift out of sync.
 */

import type { StaticImageData } from 'next/image';

import webImg from '@/public/img/services/web.jpg';
import growthImg from '@/public/img/services/growth.jpg';
import brandImg from '@/public/img/services/brand.jpg';
import merchImg from '@/public/img/services/merch.jpg';

export type Service = {
  id: string;
  title: string;
  /** Rendered as separate lines in the rail; keeps the break deliberate. */
  titleLines: string[];
  blurb: string;
  capabilities: string[];
  video: string;
  /** Static import so Next resolves the intrinsic size at build time. */
  image: StaticImageData;
  imageAlt: string;
};

export const SERVICES: Service[] = [
  {
    id: 'web',
    title: 'Website development',
    titleLines: ['Website', 'development'],
    blurb:
      'Bespoke, fast, and built to feel expensive on a three-year-old phone. Design, build and CMS in one place, so nothing is lost translating a layout into code.',
    capabilities: [
      'Brand and e-commerce sites',
      'Headless CMS and Shopify',
      'Performance and Core Web Vitals',
      'Motion and art direction',
    ],
    video: '/video/svc-web.mp4',
    image: webImg,
    imageAlt: 'A laptop on a walnut desk under a brass lamp at dusk',
  },
  {
    id: 'growth',
    title: 'AI-powered growth marketing',
    titleLines: ['AI-powered', 'growth marketing'],
    blurb:
      'Models that find the few thousand people who can actually afford you, and creative that earns their attention once found. Paid media run on signal, not spray.',
    capabilities: [
      'High-net-worth audience modelling',
      'Paid social and search',
      'Creative testing at volume',
      'Lead qualification and attribution',
    ],
    video: '/video/svc-growth.mp4',
    image: growthImg,
    imageAlt: 'Long-exposure light trails through a glass atrium at night',
  },
  {
    id: 'brand',
    title: 'Branding',
    titleLines: ['Branding'],
    blurb:
      'Naming, identity and the rules that keep it intact once fifty people are using it. Built as a working system, not a PDF that gets ignored by the third campaign.',
    capabilities: [
      'Positioning and naming',
      'Identity and art direction',
      'Typography and design systems',
      'Guidelines and asset libraries',
    ],
    video: '/video/svc-brand.mp4',
    image: brandImg,
    imageAlt: 'Embossed paper swatches fanned beside a steel rule',
  },
  {
    id: 'merch',
    title: 'Luxury merchandising',
    titleLines: ['Luxury', 'merchandising'],
    blurb:
      'Objects people keep. We design the piece, source the mill or workshop, approve the sample and manage the run — including the box it arrives in.',
    capabilities: [
      'Product and packaging design',
      'Material and finish sourcing',
      'Sampling and quality control',
      'Gifting and limited runs',
    ],
    video: '/video/svc-merch.mp4',
    image: merchImg,
    imageAlt: 'An open presentation box with ribbon and tissue',
  },
];

export const SECTORS: string[] = [
  'Yachting & charter',
  'Automotive',
  'Watches & jewellery',
  'Private aviation',
  'Real estate',
  'Hospitality & resorts',
  'Fashion & leather goods',
  "Private members' clubs",
];

export type Step = { title: string; body: string };

export const PROCESS: Step[] = [
  {
    title: 'Listen',
    body: 'A week of questions. Who buys, what they compare you to, where the brand currently leaks. We write it down and agree on it before anyone opens a design file.',
  },
  {
    title: 'Build',
    body: 'Identity, site, campaigns and product in overlapping passes rather than a relay. You see real work every week, not a reveal at the end.',
  },
  {
    title: 'Run',
    body: 'Launch is the start of the useful data. We keep the media, the content and the site moving against what the numbers show.',
  },
];

export const CONTACT_EMAIL = 'design@radlabs.com';

export const NAV_LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/studio', label: 'Studio' },
] as const;
