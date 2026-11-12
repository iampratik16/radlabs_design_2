import type { Metadata } from 'next';
import Link from 'next/link';
import BackgroundVideo from '@/components/BackgroundVideo';
import PageIntro from '@/components/PageIntro';
import CTABand from '@/components/CTABand';
import { PROCESS, SERVICES } from '@/lib/content';
import { PROJECTS, type Discipline } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Website development, AI-powered growth marketing, branding and luxury merchandising, from one senior team.',
};

/** Which services have shipped work to point at. */
const PROOF: Partial<Record<string, Discipline>> = {
  web: 'web',
  growth: 'seo',
  brand: 'brand',
};

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        title="What we make"
        lede="Four disciplines run by one senior team. Most clients arrive for one of them and end up using more, because a brand only holds together when the same people build every part of it."
      />

      <div className="srows">
        {SERVICES.map((service, i) => {
          const discipline = PROOF[service.id];
          const examples = discipline
            ? PROJECTS.filter((p) => p.disciplines.includes(discipline))
            : [];

          return (
            <section
              className={`srow${i % 2 === 1 ? ' srow--flip' : ''}`}
              id={service.id}
              key={service.id}
            >
              <div className="wrap srow__grid">
                <div className="srow__media reveal">
                  <BackgroundVideo className="srow__video" src={service.video} />
                </div>

                <div className="srow__text reveal">
                  <h2 className="srow__title">
                    {service.titleLines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </h2>

                  <p className="srow__blurb">{service.blurb}</p>

                  <ul className="srow__caps">
                    {service.capabilities.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>

                  {examples.length > 0 && (
                    <p className="srow__proof">
                      Recently:{' '}
                      {examples.map((p, n) => (
                        <span key={p.slug}>
                          {n > 0 && ', '}
                          <Link href={`/work/${p.slug}`}>{p.name}</Link>
                        </span>
                      ))}
                      .
                    </p>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="studio">
        <div className="wrap studio__grid">
          <div className="studio__intro">
            <h2 className="section-title reveal">How a project runs</h2>
            <p className="reveal">
              Small senior team, no account layer. You talk to the people doing
              the work, from the first call to the last file.
            </p>
          </div>

          <ol className="steps reveal">
            {PROCESS.map((step) => (
              <li className="step" key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CTABand />
    </>
  );
}
