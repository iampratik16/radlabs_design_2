import Link from 'next/link';
import Logo from '@/components/Logo';
import { CONTACT_EMAIL, SERVICES } from '@/lib/content';
import { PROJECTS } from '@/lib/projects';

/**
 * Sitemap footer, on the reference's structure: wordmark and a line on the
 * left, then columns — work, services, the studio.
 *
 * The reference opens with a newsletter signup. That is not built here: a
 * form that posts nowhere is worse than no form, and there is no list to
 * subscribe anyone to. The enquiry route exists and the contact page uses it;
 * when there is a list, this is where the band goes.
 */
export default function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap foot__grid">
        <div className="foot__brand">
          <Link href="/" aria-label="RadLabs Design, home">
            <Logo />
          </Link>
          <p className="foot__line">
            Design, growth
            <br />
            <em>and</em> merchandise
          </p>
        </div>

        <nav className="foot__col" aria-label="Selected work">
          <h2>Work</h2>
          <ul>
            {PROJECTS.map((p) => (
              <li key={p.slug}>
                <Link href={`/work/${p.slug}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="foot__col" aria-label="Services">
          <h2>Services</h2>
          <ul>
            {SERVICES.map((s) => (
              <li key={s.id}>
                <Link href="/services">{s.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="foot__col" aria-label="Studio">
          <h2>Studio</h2>
          <ul>
            <li><Link href="/studio">About the studio</Link></li>
            <li><Link href="/work">All work</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
          </ul>
          <p className="foot__places">Delhi · London · Bangalore</p>
        </nav>
      </div>

      <div className="wrap foot__base">
        <p>&copy; {new Date().getFullYear()} RadLabs. All rights reserved.</p>
        <p>For brands that sell on desire, not discount.</p>
      </div>
    </footer>
  );
}
