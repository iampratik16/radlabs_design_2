import { VARIANTS } from '@/lib/image-manifest';

/**
 * Custom next/image loader.
 *
 * `images.unoptimized` had to go — Vercel's optimizer answers 402 once the
 * Hobby transform quota is spent — but it took srcset with it, and phones
 * started decoding desktop sources. A custom loader gives the srcset back
 * without the optimizer: Next calls this once per configured width and we
 * point each call at a file tools/responsive-images.py already wrote.
 *
 * Static imports resolve to `/_next/static/media/<stem>.<hash>.jpg`, and the
 * stem survives the hashing, which is what makes the mapping possible. Stems
 * are asserted unique when the variants are generated.
 */
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}): string {
  // `/_next/static/media/chigwell-marquees-craft.64d764ec.jpg` -> stem
  const file = src.split('/').pop() ?? '';
  const stem = file.split('.')[0] ?? '';
  const widths = VARIANTS[stem];
  if (!widths?.length) return src;

  // The smallest variant that covers the requested width, else the largest
  // we have. This must ALWAYS resolve to a /img/rs/ URL: returning `src` for
  // the top of the range makes Next conclude the loader ignores width, and it
  // then drops srcset for that image completely — which is the whole point.
  const pick = widths.find((w) => w >= width) ?? widths[widths.length - 1];
  return `/img/rs/${stem}-${pick}.jpg`;
}
