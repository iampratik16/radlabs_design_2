'use client';

import { useEffect, useRef } from 'react';

type Props = {
  src: string;
  className?: string;
  /** Poster shown before the file loads, and the only thing shown under reduced motion. */
  poster?: string;
};

/**
 * A decorative looping video that only costs bandwidth while it is on screen.
 *
 * With six clips on this page, loading them all eagerly is the difference
 * between a reasonable site and a 20MB one. The element starts with no `src`
 * at all; the observer attaches it on first approach and pauses playback once
 * it leaves the viewport.
 */
export default function BackgroundVideo({ src, className, poster }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (typeof IntersectionObserver === 'undefined') {
      video.src = src;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!video.src) video.src = src;
            void video.play().catch(() => {
              /* autoplay refused — the poster stands in */
            });
          } else if (!video.paused) {
            video.pause();
          }
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
