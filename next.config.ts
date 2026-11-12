import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Serve the files as they are on disk.
  //
  // Vercel's image optimizer answers 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED
  // once the Hobby plan's transform quota is spent, and every /_next/image
  // request fails — the whole site loses its imagery while the source files
  // sit there serving 200. Leaning on it was a single point of failure with a
  // billing trigger.
  //
  // The cost of turning it off is no automatic resizing or AVIF/WebP, so the
  // sources have to be right: tools/compress-images.py re-encodes the
  // generated imagery (29 MB -> 2.5 MB). Re-run it after regenerating any.
  images: {
    // Not Vercel's optimizer: it answers 402 once the Hobby transform quota
    // is spent and every image on the site breaks at once. This serves
    // variants written ahead of time by tools/responsive-images.py, so a
    // phone gets a phone-sized file and nothing depends on a metered service.
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    // Must stay in step with WIDTHS in tools/responsive-images.py.
    deviceSizes: [400, 800, 1200, 1600],
    imageSizes: [200, 300],
  },

  async headers() {
    return [
      {
        // These filenames are stable but their CONTENTS change whenever the
        // hero is re-cut, so `immutable` would strand returning visitors on an
        // old montage forever. Cache for a day, then serve stale while
        // revalidating — repeat visits stay instant, a re-cut still lands.
        source: '/video/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
