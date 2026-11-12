import Link from 'next/link';
import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import ServicesRail from '@/components/ServicesRail';
import ProjectCard from '@/components/ProjectCard';
import Studio from '@/components/Studio';
import CTABand from '@/components/CTABand';
import { PROJECTS } from '@/lib/projects';

export default function Home() {
  // Three on the home page. The rest are a click away, which is the point of
  // having a work section rather than a work page.
  const featured = PROJECTS.slice(0, 3);

  return (
    <>
      {/* React hoists this into <head>. It lives here rather than in the
          layout because only this route has a hero to preload for. */}
      <link rel="preload" as="image" href="/img/hero-poster.jpg" />

      <Hero />
      <Manifesto />

      <section className="services" id="services">
        <div className="wrap services__head">
          <h2 className="section-title reveal">What we make</h2>
          <p className="services__intro reveal">
            Four disciplines, one team. Most clients start with one and end up
            using all four, because the brand only holds together when the same
            people build every part of it.
          </p>
        </div>
        <ServicesRail />
        <div className="wrap services__more reveal">
          <Link className="link" href="/services">
            What each one involves
          </Link>
        </div>
      </section>

      <section className="work">
        <div className="wrap workhead reveal">
          <h2 className="workhead__title">
            Sites, identities <em>and</em> search
            <br />
            for brands <em>the</em> world saves for
          </h2>
          <p className="workhead__eyebrow">Selected work</p>
        </div>

        <div className="wrap mosaic">
          {featured.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={i}
              priority={i === 0}
            />
          ))}
        </div>

        <div className="wrap work__more reveal">
          <Link className="link" href="/work">
            All six projects
          </Link>
        </div>
      </section>

      <Studio />
      <CTABand />
    </>
  );
}
