import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // The work stills are the only raster images on the page; letting Next
  // re-encode them to AVIF/WebP cuts them to a fraction of the JPEG weight.
  images: {
    formats: ['image/avif', 'image/webp'],
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
