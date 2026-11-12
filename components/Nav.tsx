'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import { NAV_LINKS } from '@/lib/content';

export default function Nav() {
  const pathname = usePathname();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

  // Pages that open on a full-bleed hero: the bar sits transparent over the
  // image until you scroll. Everywhere else it needs its own background from
  // the first pixel or the links sit on nothing. A case study is
  // /work/<slug> — the /work index itself is not a hero page.
  const overHero = pathname === '/' || /^\/work\/[^/]+$/.test(pathname);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer when a link actually navigates.
  useEffect(() => setOpen(false), [pathname]);

  // Lock the page behind the drawer, and give Escape its conventional meaning.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className={`nav${stuck || !overHero ? ' is-stuck' : ''}`}>
        <Link className="nav__mark" href="/" aria-label="RadLabs Design, home">
          <Logo />
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link className="btn btn--ghost nav__cta" href="/contact">
          Enquire
        </Link>

        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="navDrawer"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>

      {open && (
        <div className="drawer" id="navDrawer">
          <nav aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrent(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      )}
    </>
  );
}
