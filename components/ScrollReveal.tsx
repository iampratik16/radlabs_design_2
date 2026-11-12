'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Section-level reveal, mounted once in the layout.
 *
 * A global observer over `.reveal` keeps every section a server component —
 * wrapping each one in a client component would ship the whole page to the
 * browser just to add a class. Under reduced motion it reveals everything
 * immediately and never observes anything.
 *
 * Re-runs on navigation: a client-side route change swaps in `.reveal`
 * elements the original observer never saw, and those start at opacity 0 —
 * without this the second page a visitor opens is simply blank.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (targets.length === 0) return;

    const show = (el: HTMLElement) => el.classList.add('is-in');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      targets.forEach(show);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
