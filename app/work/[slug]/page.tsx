import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PhoneSolo } from '@/components/DeviceFrame';
import ScreenDeck from '@/components/ScreenDeck';
import { DISCIPLINE_LABEL, PROJECTS, bySlug } from '@/lib/projects';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = bySlug(slug);
  if (!project) return {};

  return {
    title: project.name,
    description: project.summary,
    openGraph: {
      title: `${project.name} · RadLabs Design`,
      description: project.summary,
      images: [
        {
          url: project.atmos.src,
          width: project.atmos.width,
          height: project.atmos.height,
        },
      ],
    },
  };
}

export default async function CasePage({ params }: Params) {
  const { slug } = await params;
  const project = bySlug(slug);
  if (!project) notFound();

  const visit = (
    <a className="caselink" href={project.url} target="_blank" rel="noreferrer">
      Visit {project.name}&rsquo;s website
      <span aria-hidden="true">&#8594;</span>
    </a>
  );

  return (
    <article className="casepage">
      {/* Image only, full bleed, with the nav transparent over it. The title
          comes after, on white — the reference holds the photograph on its
          own rather than stacking type onto it. */}
      <header className="casehero">
        <Image src={project.atmos} alt="" priority sizes="100vw" />
      </header>

      {/* Outside the hero: it clips, and a breadcrumb inside would be cut. */}
      <nav className="casehero__crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/work">Work</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{project.name}</span>
      </nav>

      <section className="caselede">
        <div className="wrap caselede__grid">
          <h1 className="caselede__title reveal">{project.name}</h1>
          <div className="caselede__body reveal">
            <p>{project.summary}</p>
            <ul className="caselede__tags">
              {project.disciplines.map((d) => (
                <li key={d}>{DISCIPLINE_LABEL[d]}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What the client got, against a detail shot. */}
      <section className="caseband">
        <div className="caseband__media reveal">
          <Image
            src={project.craft}
            alt={`${project.sector} — detail`}
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>
        <div className="caseband__body reveal">
          <h2>What {project.name} got</h2>
          <p>{project.outcome}</p>
          <ul className="caseband__list">
            {project.build.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          {project.metrics && (
            <ul className="metrics">
              {project.metrics.map((m) => (
                <li key={m.label}>
                  <strong>{m.value}</strong>
                  <span>{m.label}</span>
                </li>
              ))}
            </ul>
          )}

          {visit}
        </div>
      </section>

      {/* How the work was done, against the line the client's own site is
          built around. Quoted from their site — not a testimonial. */}
      <section className="caseapproach">
        <div className="wrap caseapproach__grid">
          <div className="caseapproach__body reveal">
            <h2>Working with {project.name}</h2>
            <p>{project.challenge}</p>
            <p>{project.solution}</p>
          </div>
          <blockquote className="caseapproach__quote reveal">
            <p>{project.line}</p>
            <cite>The line the site is built around</cite>
          </blockquote>
        </div>
      </section>

      <section className="casemobile">
        <div className="wrap casemobile__grid">
          <div className="casemobile__media reveal">
            <Image
              src={project.scene}
              alt={`${project.sector} — in context`}
              sizes="(max-width: 900px) 100vw, 46vw"
            />
          </div>
          <div className="casemobile__device reveal">
            <PhoneSolo
              src={project.phone}
              alt={`${project.name}, the mobile site`}
              slice={project.phoneSlices[0]}
            />
            <p className="casemobile__note">{project.mobile}</p>
          </div>
        </div>
      </section>

      <section className="casedeck">
        <div className="wrap">
          <h2 className="casedeck__title reveal">Screens</h2>
          <div className="reveal">
            <ScreenDeck
              src={project.desktop}
              alt={`${project.name}, the desktop site`}
              domain={project.domain}
            />
          </div>
          <div className="casedeck__cta reveal">{visit}</div>
        </div>
      </section>
    </article>
  );
}
